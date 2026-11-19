from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from ..config import get_settings
from ..db import get_db, iso
from ..deps import admin_user, current_user, session_user
from ..models import ApiKey, Bot, User
from ..schemas import AdminFlagIn, ChangePasswordIn, Credentials, KeyIn, LoginIn, PasswordIn
from ..security import create_token, hash_password, new_api_key, verify_password

router = APIRouter()


def user_out(u: User) -> dict:
    return {"id": u.id, "username": u.username, "is_admin": u.is_admin, "created_at": iso(u.created_at)}


@router.post("/auth/signup")
def signup(body: Credentials, db: Session = Depends(get_db)):
    if not get_settings().allow_signup:
        raise HTTPException(403, "가입이 닫혀 있습니다. 관리자에게 문의하세요")
    first = db.query(func.count(User.id)).scalar() == 0
    user = User(username=body.username.lower(), password_hash=hash_password(body.password), is_admin=first)
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "이미 있는 사용자 이름입니다") from None
    return {"token": create_token(user.id), "user": user_out(user)}


@router.post("/auth/login")
def login(body: LoginIn, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username.strip().lower()).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "사용자 이름 또는 비밀번호가 올바르지 않습니다")
    return {"token": create_token(user.id), "user": user_out(user)}


@router.get("/auth/me")
def me(user: User = Depends(current_user)):
    return user_out(user)


@router.post("/auth/password")
def change_password(body: ChangePasswordIn, user: User = Depends(session_user), db: Session = Depends(get_db)):
    if not verify_password(body.current, user.password_hash):
        raise HTTPException(400, "현재 비밀번호가 올바르지 않습니다")
    db.get(User, user.id).password_hash = hash_password(body.password)
    db.commit()
    return {"ok": True}


# ---------------------------------------------------------------- API 키
def key_out(k: ApiKey) -> dict:
    return {"id": k.id, "name": k.name, "prefix": k.prefix, "created_at": iso(k.created_at),
            "last_used_at": iso(k.last_used_at)}


@router.get("/keys")
def list_keys(user: User = Depends(session_user), db: Session = Depends(get_db)):
    rows = db.query(ApiKey).filter(ApiKey.user_id == user.id).order_by(ApiKey.id.desc()).all()
    return [key_out(k) for k in rows]


@router.post("/keys")
def create_key(body: KeyIn, user: User = Depends(session_user), db: Session = Depends(get_db)):
    if db.query(func.count(ApiKey.id)).filter(ApiKey.user_id == user.id).scalar() >= 20:
        raise HTTPException(400, "API 키는 20개까지 만들 수 있습니다")
    key, prefix, hashed = new_api_key()
    row = ApiKey(user_id=user.id, name=body.name.strip(), prefix=prefix, key_hash=hashed)
    db.add(row)
    db.commit()
    return {**key_out(row), "key": key}        # 원문은 이 응답에서만 볼 수 있다


@router.delete("/keys/{key_id}")
def delete_key(key_id: int, user: User = Depends(session_user), db: Session = Depends(get_db)):
    row = db.get(ApiKey, key_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, "키를 찾을 수 없습니다")
    db.delete(row)
    db.commit()
    return {"ok": True}


# ---------------------------------------------------------------- 관리자
@router.get("/admin/users")
def users(_: User = Depends(admin_user), db: Session = Depends(get_db)):
    counts = dict(db.query(Bot.owner_id, func.count(Bot.id)).group_by(Bot.owner_id).all())
    return [{**user_out(u), "bots": counts.get(u.id, 0)} for u in db.query(User).order_by(User.id).all()]


@router.post("/admin/users/{user_id}/password")
def reset_password(user_id: int, body: PasswordIn, _: User = Depends(admin_user), db: Session = Depends(get_db)):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "사용자를 찾을 수 없습니다")
    target.password_hash = hash_password(body.password)
    db.commit()
    return {"ok": True}


@router.post("/admin/users/{user_id}/admin")
def set_admin(user_id: int, body: AdminFlagIn, me_: User = Depends(admin_user), db: Session = Depends(get_db)):
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(404, "사용자를 찾을 수 없습니다")
    if target.id == me_.id and not body.is_admin:
        raise HTTPException(400, "자신의 관리자 권한은 해제할 수 없습니다")
    target.is_admin = body.is_admin
    db.commit()
    return user_out(target)
