FROM python:3.12-slim

# 빌드 시 Jenkins 가 커밋 ID 를 넣어줌 → 화면/API 에 버전으로 표시
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION} \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright \
    HOME=/tmp

WORKDIR /app
COPY requirements.txt .
# 브라우저 렌더링용 헤드리스 Chromium(+시스템 라이브러리)과 한글 글꼴을 같이 설치
#  - libatomic1: Playwright 드라이버(node) 실행에 필요
RUN apt-get update \
 && apt-get install -y --no-install-recommends libatomic1 fonts-noto-cjk \
 && pip install --no-cache-dir -r requirements.txt \
 && playwright install --with-deps --only-shell chromium \
 && rm -rf /var/lib/apt/lists/*
COPY app ./app

# root 가 아닌 사용자로 실행
USER 65534
EXPOSE 8000
# API:  아래 기본 명령 (미리보기·자동 감지는 동기 실행 → 워커 2개 + 스레드풀)
# 워커: deploy 저장소에서 command 를 `python -m app.worker` 로 바꿔 같은 이미지를 사용
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--proxy-headers", "--forwarded-allow-ips", "*"]
