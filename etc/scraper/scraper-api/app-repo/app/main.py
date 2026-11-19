"""scraper-api: 사내 웹 데이터 수집 서비스 API.  uvicorn app.main:app

  /api/...   REST API (문서: /api/docs)
  /api/mcp   MCP 서버 - Claude 같은 AI 도구가 scraper 를 도구로 호출 (app/routers/mcp.py)   화면은 별도 앱 scraper (React) 가 같은 환경의 이 API 를 호출
  /health    Kubernetes 상태 확인
  /          앱 정보 (환경, 버전)

환경변수
  APP_ENV      배포 환경 (dev / prod) - deploy 저장소의 overlay 에서 지정
  APP_VERSION  이미지 버전(커밋 ID) - 빌드 시 Dockerfile ARG 로 주입
  SCRAPER_*    app/config.py 참고
"""
from contextlib import asynccontextmanager
import socket

from fastapi import FastAPI

from .config import APP_ENV, APP_VERSION, get_settings
from .db import SessionLocal, init_db
from .models import User
from .routers import auth, bots, mcp, runs
from .security import hash_password

settings = get_settings()


def seed_admin() -> None:
    if not (settings.admin_username and settings.admin_password):
        return
    with SessionLocal() as db:
        name = settings.admin_username.lower()
        if not db.query(User).filter(User.username == name).first():
            db.add(User(username=name, password_hash=hash_password(settings.admin_password), is_admin=True))
            db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    seed_admin()
    yield


app = FastAPI(
    title="scraper-api", version=APP_VERSION, lifespan=lifespan, root_path=settings.root_path,
    description="사내 웹 데이터 수집 서비스 API. 인증: `Authorization: Bearer <토큰>` 또는 `X-API-Key: usk_...`",
    docs_url="/api/docs", openapi_url="/api/openapi.json", redoc_url=None,
)
for r in (auth.router, bots.router, runs.router, mcp.router):
    app.include_router(r, prefix="/api")


@app.get("/health", include_in_schema=False)
def health():
    return {"status": "ok", "env": APP_ENV, "version": APP_VERSION}


@app.get("/", include_in_schema=False)
def index():
    return {"app": "scraper-api", "env": APP_ENV, "version": APP_VERSION, "pod": socket.gethostname(),
            "message": "사내 웹 데이터 수집 API", "docs": f"{settings.root_path}/api/docs"}
