from datetime import datetime, timezone

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from .config import get_settings

_url = get_settings().database_url
_is_sqlite = _url.startswith("sqlite")
engine = create_engine(
    _url,
    pool_pre_ping=True,
    connect_args={"check_same_thread": False} if _is_sqlite else {},
)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


def utcnow() -> datetime:
    """DB 에는 시간대 없는 UTC 로 저장한다."""
    return datetime.now(timezone.utc).replace(tzinfo=None)


def iso(dt: datetime | None) -> str | None:
    return dt.isoformat(timespec="seconds") + "Z" if dt else None


def init_db() -> None:
    from . import models  # noqa: F401  (테이블 등록)

    if _is_sqlite:
        Base.metadata.create_all(engine)
        return
    # API Pod 여러 개와 워커가 동시에 시작해도 테이블 생성이 겹치지 않게 잠금
    with engine.begin() as conn:
        conn.execute(text("SELECT pg_advisory_xact_lock(72190311)"))
        Base.metadata.create_all(conn)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
