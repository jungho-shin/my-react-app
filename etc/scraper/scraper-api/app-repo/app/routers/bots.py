from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from .. import schedule
from ..db import get_db, iso, utcnow
from ..deps import Caller, current_user, get_caller
from ..engine import detect as detector
from ..engine import fetch
from ..engine.runner import RunFailed, execute
from ..jobs import columns, enqueue, run_out
from ..models import Bot, Item, Run, User
from ..schemas import BotConfig, BotIn, DetectIn
from ..templates import TEMPLATES

router = APIRouter()


def get_bot(db: Session, bot_id: int) -> Bot:
    bot = db.get(Bot, bot_id)
    if not bot:
        raise HTTPException(404, "봇을 찾을 수 없습니다")
    return bot


def can_edit(bot: Bot, user: User) -> bool:
    return user.is_admin or bot.owner_id == user.id


def editable_bot(db: Session, bot_id: int, user: User) -> Bot:
    bot = get_bot(db, bot_id)
    if not can_edit(bot, user):
        raise HTTPException(403, "만든 사람 또는 관리자만 바꿀 수 있습니다")
    return bot


def bot_out(bot: Bot, user: User, owner: str, last_run: Run | None, full: bool = True) -> dict:
    out = {
        "id": bot.id, "name": bot.name, "description": bot.description,
        "owner": owner, "can_edit": can_edit(bot, user),
        "schedule_type": bot.schedule_type, "schedule_value": bot.schedule_value,
        "next_run_at": iso(bot.next_run_at), "webhook_url": bot.webhook_url,
        "render": bot.config.get("render", "http"),
        "start_url": (bot.config.get("start_urls") or [bot.config.get("pagination", {}).get("template", "")])[0],
        "created_at": iso(bot.created_at), "updated_at": iso(bot.updated_at),
        "last_run": run_out(last_run) if last_run else None,
    }
    if full:
        out["config"] = bot.config
    return out


def _owners(db: Session) -> dict[int, str]:
    return dict(db.query(User.id, User.username).all())


@router.get("/templates")
def templates(_: User = Depends(current_user)):
    return TEMPLATES


@router.get("/bots")
def list_bots(user: User = Depends(current_user), db: Session = Depends(get_db)):
    bots = db.query(Bot).order_by(Bot.id.desc()).all()
    last_ids = db.query(func.max(Run.id)).group_by(Run.bot_id).all()
    last = {r.bot_id: r for r in db.query(Run).filter(Run.id.in_([i for (i,) in last_ids])).all()} if last_ids else {}
    owners = _owners(db)
    return [bot_out(b, user, owners.get(b.owner_id, "?"), last.get(b.id), full=False) for b in bots]


@router.post("/bots", status_code=201)
def create_bot(body: BotIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    bot = Bot(owner_id=user.id)
    _apply(bot, body)
    db.add(bot)
    db.commit()
    return bot_out(bot, user, user.username, None)


@router.get("/bots/{bot_id}")
def read_bot(bot_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    bot = get_bot(db, bot_id)
    last = db.query(Run).filter(Run.bot_id == bot.id).order_by(Run.id.desc()).first()
    return bot_out(bot, user, _owners(db).get(bot.owner_id, "?"), last)


@router.put("/bots/{bot_id}")
def update_bot(bot_id: int, body: BotIn, user: User = Depends(current_user), db: Session = Depends(get_db)):
    bot = editable_bot(db, bot_id, user)
    _apply(bot, body)
    db.commit()
    last = db.query(Run).filter(Run.bot_id == bot.id).order_by(Run.id.desc()).first()
    return bot_out(bot, user, _owners(db).get(bot.owner_id, "?"), last)


@router.delete("/bots/{bot_id}")
def delete_bot(bot_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    bot = editable_bot(db, bot_id, user)
    # SQLite(테스트)는 FK cascade 가 꺼져 있을 수 있어 직접 지운다
    db.query(Item).filter(Item.bot_id == bot.id).delete(synchronize_session=False)
    db.query(Run).filter(Run.bot_id == bot.id).delete(synchronize_session=False)
    db.delete(bot)
    db.commit()
    return {"ok": True}


def _apply(bot: Bot, body: BotIn) -> None:
    changed = (bot.schedule_type, bot.schedule_value) != (body.schedule_type, body.schedule_value)
    bot.name, bot.description = body.name, body.description.strip()
    bot.config = body.config.model_dump()
    bot.schedule_type, bot.schedule_value = body.schedule_type, body.schedule_value
    bot.webhook_url = body.webhook_url
    bot.updated_at = utcnow()
    if changed or (bot.schedule_type != "none" and bot.next_run_at is None):
        bot.next_run_at = schedule.next_run(bot.schedule_type, bot.schedule_value, utcnow())


@router.post("/bots/{bot_id}/run", status_code=202)
def run_bot(bot_id: int, caller: Caller = Depends(get_caller), db: Session = Depends(get_db)):
    bot = get_bot(db, bot_id)
    run = enqueue(db, bot, "api" if caller.via_key else "manual", caller.user.username)
    if not run:
        raise HTTPException(409, "이미 대기 중이거나 실행 중입니다")
    return run_out(run, bot.name)


# ---------------------------------------------------------------- 미리보기 · 자동 감지
# 저장하지 않고 첫 페이지만 바로 수집해 본다 (API Pod 에서 실행 → 건수·상세 페이지 수를 작게 제한)
@router.post("/preview")
def preview(config: BotConfig, _: User = Depends(current_user)):
    cfg = config.model_dump()
    lines: list[str] = []
    rows: list[dict] = []
    fetcher = fetch.make_fetcher(cfg, lines.append)
    error = ""
    try:
        execute(cfg, fetcher, log=lines.append, emit=lambda items, _s: rows.extend(items),
                max_pages=1, max_items=20, detail_limit=3)
    except RunFailed as e:
        error = str(e)
    finally:
        fetcher.close()
    return {"columns": columns(cfg, rows), "items": rows, "log": lines, "error": error}


@router.post("/detect")
def detect(body: DetectIn, _: User = Depends(current_user)):
    cfg = {"render": body.render, "wait_for": body.wait_for, "limits": {"delay_ms": 0}}
    fetcher = fetch.make_fetcher(cfg)
    try:
        page = fetcher.fetch(body.url)
    except fetch.FetchError as e:
        raise HTTPException(400, f"페이지를 가져오지 못했습니다: {e}") from None
    finally:
        fetcher.close()
    return {"url": page.url, "candidates": detector.detect(page.html, page.url)}
