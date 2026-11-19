from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from .db import Base, utcnow

Json = JSON().with_variant(JSONB(), "postgresql")


class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(100))
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class ApiKey(Base):
    __tablename__ = "api_keys"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name: Mapped[str] = mapped_column(String(60))
    prefix: Mapped[str] = mapped_column(String(16))          # 화면 표시용 앞부분
    key_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    last_used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class Bot(Base):
    """수집 봇 1개 = 수집 규칙(config) + 예약 + 알림 설정."""

    __tablename__ = "bots"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80))
    description: Mapped[str] = mapped_column(String(500), default="")
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    config: Mapped[dict] = mapped_column(Json)
    schedule_type: Mapped[str] = mapped_column(String(10), default="none")   # none|interval|daily|cron
    schedule_value: Mapped[str] = mapped_column(String(60), default="")
    next_run_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True, index=True)
    webhook_url: Mapped[str] = mapped_column(String(500), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Run(Base):
    __tablename__ = "runs"
    id: Mapped[int] = mapped_column(primary_key=True)
    bot_id: Mapped[int] = mapped_column(ForeignKey("bots.id", ondelete="CASCADE"), index=True)
    status: Mapped[str] = mapped_column(String(10), default="queued", index=True)  # queued|running|success|failed|canceled
    trigger: Mapped[str] = mapped_column(String(10), default="manual")              # manual|schedule|api
    requested_by: Mapped[str] = mapped_column(String(40), default="")
    cancel_requested: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, index=True)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    heartbeat_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    pages: Mapped[int] = mapped_column(Integer, default=0)
    item_count: Mapped[int] = mapped_column(Integer, default=0)
    new_count: Mapped[int] = mapped_column(Integer, default=0)
    error: Mapped[str] = mapped_column(Text, default="")
    log: Mapped[str] = mapped_column(Text, default="")
    worker: Mapped[str] = mapped_column(String(80), default="")


class Item(Base):
    __tablename__ = "items"
    id: Mapped[int] = mapped_column(primary_key=True)
    run_id: Mapped[int] = mapped_column(ForeignKey("runs.id", ondelete="CASCADE"))
    bot_id: Mapped[int] = mapped_column(Integer)
    seq: Mapped[int] = mapped_column(Integer)
    data: Mapped[dict] = mapped_column(Json)
    key_hash: Mapped[str] = mapped_column(String(40))
    is_new: Mapped[bool] = mapped_column(Boolean, default=True)   # 이전 실행에 없던 데이터

    __table_args__ = (
        Index("ix_items_run_seq", "run_id", "seq"),
        Index("ix_items_bot_key", "bot_id", "key_hash"),
    )
