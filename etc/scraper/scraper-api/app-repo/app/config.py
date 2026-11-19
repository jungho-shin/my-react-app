"""환경 설정. 모든 값은 환경변수 SCRAPER_* 로 바꿀 수 있다 (deploy 저장소 overlay / Secret)."""
import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SCRAPER_")

    database_url: str = "sqlite:///./scraper.db"
    jwt_secret: str = "local-dev-secret-change-me-0123456789"
    jwt_hours: int = 72
    # ingress 가 /scraper-api 를 떼고 전달한다. 문서(/api/docs) 주소 계산과 직접 접속(/scraper-api/...) 처리를 위해 지정
    root_path: str = ""
    # 결과 링크(webhook 본문)에 쓰는 외부 주소. 예: http://192.168.45.116:8280/scraper-api
    public_url: str = ""

    allow_signup: bool = True
    # 지정하면 시작 시 관리자 계정을 만든다 (이미 있으면 그대로 둠)
    admin_username: str = ""
    admin_password: str = ""

    tz: str = "Asia/Seoul"                  # 예약(매일/cron) 기준 시간대

    # ---- 수집 대상 제한 (SSRF 방지) ----
    # 기본: 사설/내부 주소(클러스터, 10.x, 192.168.x, localhost ...)는 수집 불가
    allow_private: bool = False
    # 예외로 허용할 내부 호스트 (쉼표 구분, 호스트 이름 끝부분 또는 CIDR). 예: intra.example.co.kr,10.20.0.0/16
    allow_hosts: str = ""

    user_agent: str = (
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/131.0.0.0 Safari/537.36 uman-scraper/1.0"
    )
    request_timeout: float = 20.0
    max_body_bytes: int = 8 * 1024 * 1024
    min_delay_ms: int = 300                 # 요청 사이 최소 간격 (대상 사이트 보호)
    max_pages_limit: int = 500
    max_items_limit: int = 50000

    # ---- 워커 ----
    worker_concurrency: int = 2
    keep_runs: int = 30                     # 봇마다 보관할 실행 이력 수 (넘으면 오래된 실행·데이터 삭제)
    stale_minutes: int = 15                 # 이 시간 동안 진행 신호가 없는 실행은 실패 처리


@lru_cache
def get_settings() -> Settings:
    return Settings()


APP_ENV = os.environ.get("APP_ENV", "local")
APP_VERSION = os.environ.get("APP_VERSION", "dev")
