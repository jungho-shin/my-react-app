"""실행(run) 대기열과 결과 저장에 쓰는 공통 함수 (API 와 워커가 같이 사용)."""
import hashlib
import json

from sqlalchemy.orm import Session

from .db import iso
from .models import Bot, Run

ACTIVE = ("queued", "running")


def active_run(db: Session, bot_id: int) -> Run | None:
    return db.query(Run).filter(Run.bot_id == bot_id, Run.status.in_(ACTIVE)).first()


def enqueue(db: Session, bot: Bot, trigger: str, requested_by: str = "") -> Run | None:
    """대기열에 넣는다. 같은 봇이 이미 대기/실행 중이면 None."""
    if active_run(db, bot.id):
        return None
    run = Run(bot_id=bot.id, trigger=trigger, requested_by=requested_by)
    db.add(run)
    db.commit()
    return run


def key_hash(row: dict, key_fields: list[str]) -> str:
    """중복 판단 기준 필드(없으면 행 전체)의 해시."""
    basis = {k: row.get(k) for k in key_fields} if key_fields else row
    raw = json.dumps(basis, ensure_ascii=False, sort_keys=True, default=str)
    return hashlib.sha1(raw.encode()).hexdigest()


def columns(config: dict, rows: list[dict] = ()) -> list[str]:
    """표·내보내기 열 순서: 봇에 정의한 필드 순서 → 그 밖에 데이터에만 있는 열."""
    cols = [f["name"] for f in config.get("fields") or []]
    detail = config.get("detail") or {}
    if detail.get("enabled"):
        cols += [f["name"] for f in detail.get("fields") or [] if f["name"] not in cols]
    for row in rows:
        for k in row:
            if k not in cols:
                cols.append(k)
    return cols


def run_out(run: Run, bot_name: str = "", with_log: bool = False) -> dict:
    end = run.finished_at or run.heartbeat_at
    out = {
        "id": run.id, "bot_id": run.bot_id, "bot_name": bot_name, "status": run.status,
        "trigger": run.trigger, "requested_by": run.requested_by,
        "created_at": iso(run.created_at), "started_at": iso(run.started_at), "finished_at": iso(run.finished_at),
        "seconds": int((end - run.started_at).total_seconds()) if run.started_at and end else None,
        "pages": run.pages, "item_count": run.item_count, "new_count": run.new_count,
        "error": run.error, "cancel_requested": run.cancel_requested,
    }
    if with_log:
        out["log"] = run.log
    return out
