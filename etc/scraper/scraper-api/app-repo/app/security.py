import hashlib
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from .config import get_settings

API_KEY_PREFIX = "usk_"


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except ValueError:
        return False


def create_token(user_id: int) -> str:
    s = get_settings()
    exp = datetime.now(timezone.utc) + timedelta(hours=s.jwt_hours)
    return jwt.encode({"sub": str(user_id), "exp": exp}, s.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> int | None:
    try:
        return int(jwt.decode(token, get_settings().jwt_secret, algorithms=["HS256"])["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        return None


def new_api_key() -> tuple[str, str, str]:
    """→ (원문 키, 표시용 앞부분, 저장용 해시). 원문은 발급 시 한 번만 보여 준다."""
    key = API_KEY_PREFIX + secrets.token_urlsafe(32)
    return key, key[:10], hash_api_key(key)


def hash_api_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()
