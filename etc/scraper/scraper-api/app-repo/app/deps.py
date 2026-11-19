from fastapi import Depends, Header, HTTPException
from sqlalchemy.orm import Session

from .db import get_db, utcnow
from .models import ApiKey, User
from .security import API_KEY_PREFIX, decode_token, hash_api_key


class Caller:
    """요청한 사람 + 인증 방식 (화면 로그인 / API 키)."""

    def __init__(self, user: User, via_key: bool):
        self.user, self.via_key = user, via_key


def _by_key(db: Session, key: str) -> User | None:
    row = db.query(ApiKey).filter(ApiKey.key_hash == hash_api_key(key)).first()
    if not row:
        return None
    row.last_used_at = utcnow()
    db.commit()
    return db.get(User, row.user_id)


def get_caller(
    authorization: str | None = Header(default=None),
    x_api_key: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> Caller:
    token = ""
    if authorization and authorization.lower().startswith("bearer "):
        token = authorization[7:].strip()
    key = x_api_key or (token if token.startswith(API_KEY_PREFIX) else "")
    if key:
        user = _by_key(db, key.strip())
        if user:
            return Caller(user, True)
        raise HTTPException(401, "API 키가 올바르지 않습니다")
    user_id = decode_token(token) if token else None
    user = db.get(User, user_id) if user_id else None
    if not user:
        raise HTTPException(401, "로그인이 필요합니다")
    return Caller(user, False)


def current_user(caller: Caller = Depends(get_caller)) -> User:
    return caller.user


def session_user(caller: Caller = Depends(get_caller)) -> User:
    """계정·키 관리는 화면 로그인으로만 (API 키로 새 키를 만들거나 비밀번호를 바꾸지 못하게)."""
    if caller.via_key:
        raise HTTPException(403, "이 기능은 화면에 로그인해서 사용하세요")
    return caller.user


def admin_user(user: User = Depends(session_user)) -> User:
    if not user.is_admin:
        raise HTTPException(403, "관리자만 사용할 수 있습니다")
    return user
