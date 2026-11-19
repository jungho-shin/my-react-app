from datetime import timedelta
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, update
from sqlalchemy.orm import Session

from .. import exporter
from ..config import APP_ENV, APP_VERSION, get_settings
from ..db import get_db, iso, utcnow
from ..deps import current_user
from ..engine.fetch import browser_available
from ..jobs import ACTIVE, columns, run_out
from ..models import Bot, Item, Run, User
from .bots import get_bot

router = APIRouter()


@router.get("/info")
def info():
    s = get_settings()
    return {"app": "scraper-api", "env": APP_ENV, "version": APP_VERSION, "allow_signup": s.allow_signup,
            "browser": browser_available(), "tz": s.tz, "keep_runs": s.keep_runs,
            "max_pages": s.max_pages_limit, "max_items": s.max_items_limit, "min_delay_ms": s.min_delay_ms}


def _names(db: Session) -> dict[int, str]:
    return dict(db.query(Bot.id, Bot.name).all())


def get_run(db: Session, run_id: int) -> Run:
    run = db.get(Run, run_id)
    if not run:
        raise HTTPException(404, "실행 이력을 찾을 수 없습니다")
    return run


def latest_success(db: Session, bot_id: int) -> Run:
    run = db.query(Run).filter(Run.bot_id == bot_id, Run.status == "success").order_by(Run.id.desc()).first()
    if not run:
        raise HTTPException(404, "성공한 실행이 아직 없습니다")
    return run


# ---------------------------------------------------------------- 실행 이력
@router.get("/runs")
def list_runs(bot_id: int | None = None, status: str | None = None,
              limit: int = Query(50, ge=1, le=200), offset: int = Query(0, ge=0),
              _: User = Depends(current_user), db: Session = Depends(get_db)):
    q = db.query(Run)
    if bot_id:
        q = q.filter(Run.bot_id == bot_id)
    if status:
        q = q.filter(Run.status == status)
    total = q.count()
    names = _names(db)
    rows = q.order_by(Run.id.desc()).offset(offset).limit(limit).all()
    return {"total": total, "runs": [run_out(r, names.get(r.bot_id, "")) for r in rows]}


@router.get("/runs/{run_id}")
def read_run(run_id: int, _: User = Depends(current_user), db: Session = Depends(get_db)):
    run = get_run(db, run_id)
    return run_out(run, _names(db).get(run.bot_id, ""), with_log=True)


@router.post("/runs/{run_id}/cancel")
def cancel_run(run_id: int, _: User = Depends(current_user), db: Session = Depends(get_db)):
    run = get_run(db, run_id)
    if run.status not in ACTIVE:
        raise HTTPException(409, "이미 끝난 실행입니다")
    # 대기 중이면 바로 취소, 실행 중이면 워커가 다음 페이지 전에 멈춘다
    done = db.execute(update(Run).where(Run.id == run_id, Run.status == "queued")
                      .values(status="canceled", finished_at=utcnow(), error="실행 전에 취소됨"))
    if done.rowcount == 0:
        db.execute(update(Run).where(Run.id == run_id).values(cancel_requested=True))
    db.commit()
    db.refresh(run)
    return run_out(run, _names(db).get(run.bot_id, ""))


# ---------------------------------------------------------------- 데이터 조회 · 내보내기
def _items(db: Session, run: Run, offset: int, limit: int, new_only: bool) -> dict:
    bot = get_bot(db, run.bot_id)
    q = db.query(Item).filter(Item.run_id == run.id)
    if new_only:
        q = q.filter(Item.is_new.is_(True))
    total = q.count()
    rows = q.order_by(Item.seq).offset(offset).limit(limit).all()
    return {
        "run": run_out(run, bot.name), "total": total,
        "columns": columns(bot.config, [r.data for r in rows]),
        "items": [{"seq": r.seq, "is_new": r.is_new, "data": r.data} for r in rows],
    }


def _export(db: Session, run: Run, fmt: str, new_only: bool):
    if fmt not in exporter.FORMATS:
        raise HTTPException(400, "format 은 xlsx, csv, json 중 하나여야 합니다")
    bot = get_bot(db, run.bot_id)
    q = db.query(Item.data).filter(Item.run_id == run.id)
    if new_only:
        q = q.filter(Item.is_new.is_(True))
    rows = [d for (d,) in q.order_by(Item.seq).all()]
    return exporter.export(fmt, f"{bot.name}_{run.id}", columns(bot.config, rows), rows)


@router.get("/runs/{run_id}/items")
def run_items(run_id: int, offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=1000),
              new_only: bool = False, _: User = Depends(current_user), db: Session = Depends(get_db)):
    return _items(db, get_run(db, run_id), offset, limit, new_only)


@router.get("/runs/{run_id}/export")
def run_export(run_id: int, format: str = "xlsx", new_only: bool = False,
               _: User = Depends(current_user), db: Session = Depends(get_db)):
    return _export(db, get_run(db, run_id), format, new_only)


# 외부 시스템 연동용: 항상 '가장 최근에 성공한 실행'의 데이터
@router.get("/bots/{bot_id}/latest/items")
def latest_items(bot_id: int, offset: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=1000),
                 new_only: bool = False, _: User = Depends(current_user), db: Session = Depends(get_db)):
    get_bot(db, bot_id)
    return _items(db, latest_success(db, bot_id), offset, limit, new_only)


@router.get("/bots/{bot_id}/latest/export")
def latest_export(bot_id: int, format: str = "xlsx", new_only: bool = False,
                  _: User = Depends(current_user), db: Session = Depends(get_db)):
    get_bot(db, bot_id)
    return _export(db, latest_success(db, bot_id), format, new_only)


# ---------------------------------------------------------------- 대시보드
@router.get("/dashboard")
def dashboard(_: User = Depends(current_user), db: Session = Depends(get_db)):
    now = utcnow()
    tz = ZoneInfo(get_settings().tz)
    names = _names(db)
    day = now - timedelta(hours=24)

    def count(*cond) -> int:
        return db.query(func.count(Run.id)).filter(*cond).scalar() or 0

    # 최근 7일(현지 날짜 기준) 하루 단위 집계
    week = db.query(Run.created_at, Run.status, Run.item_count).filter(Run.created_at >= now - timedelta(days=7)).all()
    today = now.replace(tzinfo=ZoneInfo("UTC")).astimezone(tz).date()
    days = {str(today - timedelta(days=i)): {"runs": 0, "failed": 0, "items": 0} for i in range(6, -1, -1)}
    for created, status, items in week:
        key = str(created.replace(tzinfo=ZoneInfo("UTC")).astimezone(tz).date())
        if key in days:
            days[key]["runs"] += 1
            days[key]["failed"] += status == "failed"
            days[key]["items"] += items or 0

    upcoming = (db.query(Bot).filter(Bot.schedule_type != "none", Bot.next_run_at.isnot(None))
                .order_by(Bot.next_run_at).limit(5).all())
    recent = db.query(Run).order_by(Run.id.desc()).limit(8).all()
    return {
        "bots": len(names),
        "scheduled": db.query(func.count(Bot.id)).filter(Bot.schedule_type != "none").scalar() or 0,
        "active": count(Run.status.in_(ACTIVE)),
        "runs_24h": count(Run.created_at >= day),
        "failed_24h": count(Run.created_at >= day, Run.status == "failed"),
        "items_24h": db.query(func.coalesce(func.sum(Run.item_count), 0)).filter(Run.created_at >= day).scalar(),
        "new_24h": db.query(func.coalesce(func.sum(Run.new_count), 0)).filter(Run.created_at >= day).scalar(),
        "days": [{"date": d, **v} for d, v in days.items()],
        "recent": [run_out(r, names.get(r.bot_id, "")) for r in recent],
        "upcoming": [{"id": b.id, "name": b.name, "next_run_at": iso(b.next_run_at),
                      "schedule_type": b.schedule_type, "schedule_value": b.schedule_value} for b in upcoming],
    }
