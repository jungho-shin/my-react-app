"""수집 워커:  python -m app.worker

- 대기열(runs.status = queued)에서 실행을 하나씩 집어 수집하고 결과(items)를 저장한다.
- 예약된 봇의 실행 시각이 되면 대기열에 넣는다.
- 워커를 여러 개 띄워도 같은 실행·같은 예약을 두 번 처리하지 않는다 (조건부 UPDATE 로 선점).
"""
import logging
import os
import signal
import socket
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

import httpx
from sqlalchemy import select, update

from . import schedule
from .config import get_settings
from .db import SessionLocal, init_db, iso, utcnow
from .engine import fetch
from .engine.netguard import Blocked, check_url
from .engine.runner import RunFailed, Stats, execute
from .jobs import columns, enqueue, key_hash
from .models import Bot, Item, Run

log = logging.getLogger("worker")
ALIVE_FILE = Path(os.environ.get("SCRAPER_ALIVE_FILE", "/tmp/worker-alive"))
MAX_LOG = 200_000
WEBHOOK_ITEMS = 500
STOP = threading.Event()        # 종료 신호(SIGTERM): 진행 중인 실행을 다음 페이지 전에 멈춘다


# ---------------------------------------------------------------- 실행 1건
def claim(worker: str) -> int | None:
    """가장 오래된 대기 실행을 선점. 다른 워커가 먼저 가져갔으면 다음 것을 시도."""
    with SessionLocal() as db:
        for (run_id,) in db.execute(select(Run.id).where(Run.status == "queued").order_by(Run.id).limit(5)).all():
            now = utcnow()
            got = db.execute(update(Run).where(Run.id == run_id, Run.status == "queued")
                             .values(status="running", started_at=now, heartbeat_at=now, worker=worker))
            db.commit()
            if got.rowcount == 1:
                return run_id
    return None


def process(run_id: int) -> None:
    with SessionLocal() as db:
        run = db.get(Run, run_id)
        bot = db.get(Bot, run.bot_id) if run else None
        if not bot:
            return
        config, bot_id, bot_name, webhook = dict(bot.config), bot.id, bot.name, bot.webhook_url
    key_fields = config.get("key_fields") or []
    tz = ZoneInfo(get_settings().tz)
    lines: list[str] = []
    seq = 0

    def say(msg: str) -> None:
        lines.append(f"{datetime.now(tz):%H:%M:%S} {msg}")

    def save_progress(db, stats: Stats, **extra) -> None:
        db.execute(update(Run).where(Run.id == run_id).values(
            pages=stats.pages, item_count=stats.items, heartbeat_at=utcnow(),
            log="\n".join(lines)[-MAX_LOG:], **extra))
        db.commit()

    def emit(rows: list[dict], stats: Stats) -> None:
        nonlocal seq
        with SessionLocal() as db:
            hashes = [key_hash(r, key_fields) for r in rows]
            known = set()
            if hashes:
                known = {h for (h,) in db.execute(
                    select(Item.key_hash).where(Item.bot_id == bot_id, Item.run_id != run_id,
                                                Item.key_hash.in_(set(hashes))))}
            for row, h in zip(rows, hashes):
                seq += 1
                db.add(Item(run_id=run_id, bot_id=bot_id, seq=seq, data=row, key_hash=h, is_new=h not in known))
            new = sum(1 for h in hashes if h not in known)
            save_progress(db, stats, new_count=Run.new_count + new)

    def known(rows: list[dict]) -> list[bool]:
        """skip_known: 이 봇의 이전 실행에 같은 데이터(key_fields 기준)가 있는가."""
        hashes = [key_hash(r, key_fields) for r in rows]
        with SessionLocal() as db:
            have = {h for (h,) in db.execute(
                select(Item.key_hash).where(Item.bot_id == bot_id, Item.run_id != run_id,
                                            Item.key_hash.in_(set(hashes))))}
        return [h in have for h in hashes]

    def should_cancel() -> bool:
        if STOP.is_set():
            return True
        with SessionLocal() as db:
            return bool(db.execute(select(Run.cancel_requested).where(Run.id == run_id)).scalar())

    say(f"시작: {bot_name} ({'브라우저 렌더링' if config.get('render') == 'browser' else 'HTTP'})")
    status, error, stats = "success", "", Stats()
    fetcher = fetch.make_fetcher(config, say)
    try:
        stats = execute(config, fetcher, log=say, emit=emit, should_cancel=should_cancel, known=known)
        if stats.canceled and STOP.is_set():
            status, error = "failed", "워커가 재시작되어 중단되었습니다. 다시 실행하세요"
        elif stats.canceled:
            status, error = "canceled", "사용자가 취소함"
    except RunFailed as e:
        status, error = "failed", str(e)
    except Exception as e:  # noqa: BLE001  (예상하지 못한 오류도 실행 이력에 남긴다)
        log.exception("run %s", run_id)
        status, error = "failed", f"내부 오류: {type(e).__name__}: {str(e)[:300]}"
    finally:
        fetcher.close()

    with SessionLocal() as db:
        run = db.get(Run, run_id)
        run.pages = max(run.pages or 0, stats.pages)        # 모두 건너뛰면 emit 이 없어 진행 상황이 저장되지 않았다
        say(f"끝: {status} · 페이지 {run.pages} · {run.item_count}건 (신규 {run.new_count}건)"
            + (f" · 이미 수집해 건너뜀 {stats.skipped}건" if stats.skipped else "")
            + (f" · 실패한 요청 {stats.errors}건" if stats.errors else "") + (f" · {error}" if error else ""))
        run.status, run.error, run.finished_at, run.heartbeat_at = status, error, utcnow(), utcnow()
        run.log = "\n".join(lines)[-MAX_LOG:]
        db.commit()
        if webhook:
            say(send_webhook(db, webhook, run, bot_name, config))
            run.log = "\n".join(lines)[-MAX_LOG:]
            db.commit()
        prune(db, bot_id)
    log.info("run %s (%s) %s: %s건", run_id, bot_name, status, stats.items)


def send_webhook(db, url: str, run: Run, bot_name: str, config: dict) -> str:
    """실행이 끝나면 결과를 POST. 실패해도 실행 결과에는 영향 없음 (로그에만 남김)."""
    s = get_settings()
    rows = [d for (d,) in db.execute(
        select(Item.data).where(Item.run_id == run.id).order_by(Item.seq).limit(WEBHOOK_ITEMS))]
    base = s.public_url.rstrip("/")
    body = {
        "event": "run.finished",
        "bot": {"id": run.bot_id, "name": bot_name},
        "run": {"id": run.id, "status": run.status, "trigger": run.trigger, "pages": run.pages,
                "item_count": run.item_count, "new_count": run.new_count, "error": run.error,
                "started_at": iso(run.started_at), "finished_at": iso(run.finished_at)},
        "columns": columns(config, rows),
        "items": rows,                          # 최대 500건. 전체는 items_url 로 조회
        "items_truncated": run.item_count > len(rows),
        "items_url": f"{base}/api/runs/{run.id}/items" if base else None,
    }
    try:
        check_url(url)
        r = httpx.post(url, json=body, timeout=10, follow_redirects=False,
                       headers={"User-Agent": "uman-scraper-webhook/1.0"})
        return f"webhook → HTTP {r.status_code}"
    except Blocked as e:
        return f"webhook 실패: {e}"
    except httpx.HTTPError as e:
        return f"webhook 실패: {type(e).__name__}"


def prune(db, bot_id: int) -> None:
    """봇마다 최근 keep_runs 개의 실행만 보관."""
    keep = get_settings().keep_runs
    old = [i for (i,) in db.execute(
        select(Run.id).where(Run.bot_id == bot_id, Run.status.notin_(("queued", "running")))
        .order_by(Run.id.desc()).offset(keep))]
    if old:
        db.query(Item).filter(Item.run_id.in_(old)).delete(synchronize_session=False)
        db.query(Run).filter(Run.id.in_(old)).delete(synchronize_session=False)
        db.commit()


# ---------------------------------------------------------------- 예약 · 정리
def schedule_tick() -> int:
    """실행 시각이 된 봇을 대기열에 넣고 다음 시각을 계산. → 넣은 건수"""
    queued = 0
    with SessionLocal() as db:
        now = utcnow()
        due = db.execute(select(Bot).where(Bot.schedule_type != "none", Bot.next_run_at.isnot(None),
                                           Bot.next_run_at <= now)).scalars().all()
        for bot in due:
            nxt = schedule.next_run(bot.schedule_type, bot.schedule_value, now)
            # 다른 워커와 겹치지 않게: next_run_at 이 그대로일 때만 갱신에 성공
            got = db.execute(update(Bot).where(Bot.id == bot.id, Bot.next_run_at == bot.next_run_at)
                             .values(next_run_at=nxt))
            db.commit()
            if got.rowcount == 1 and enqueue(db, bot, "schedule", "예약"):
                queued += 1
    return queued


def recover_stale() -> None:
    """워커가 죽어서 멈춘 실행을 실패로 정리."""
    limit = utcnow() - timedelta(minutes=get_settings().stale_minutes)
    with SessionLocal() as db:
        db.execute(update(Run).where(Run.status == "running", Run.heartbeat_at < limit)
                   .values(status="failed", finished_at=utcnow(), error="워커가 중단되어 실행이 끝나지 못했습니다"))
        db.commit()


# ---------------------------------------------------------------- 메인 루프
def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
    logging.getLogger("httpx").setLevel(logging.WARNING)
    s = get_settings()
    init_db()
    name = socket.gethostname()
    stop = STOP
    signal.signal(signal.SIGTERM, lambda *_: stop.set())
    signal.signal(signal.SIGINT, lambda *_: stop.set())

    slots = threading.Semaphore(s.worker_concurrency)
    pool = ThreadPoolExecutor(max_workers=s.worker_concurrency, thread_name_prefix="run")

    def job(run_id: int) -> None:
        try:
            process(run_id)
        except Exception:  # noqa: BLE001
            log.exception("run %s 처리 실패", run_id)
        finally:
            slots.release()

    log.info("워커 시작: %s (동시 실행 %d, 브라우저 %s)", name, s.worker_concurrency,
             "사용 가능" if fetch.browser_available() else "없음")
    last_tick = 0.0
    while not stop.is_set():
        try:
            ALIVE_FILE.touch()
            if time.monotonic() - last_tick > 15:
                last_tick = time.monotonic()
                schedule_tick()
                recover_stale()
            while slots.acquire(blocking=False):
                run_id = claim(name)
                if run_id is None:
                    slots.release()
                    break
                pool.submit(job, run_id)
        except Exception:  # noqa: BLE001  (DB 일시 장애 등 - 다음 주기에 다시 시도)
            log.exception("워커 루프 오류")
        stop.wait(2)
    log.info("종료 신호 - 진행 중인 실행을 마치는 중")
    pool.shutdown(wait=True)


if __name__ == "__main__":
    main()
