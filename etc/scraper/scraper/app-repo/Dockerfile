# ---- 1) 빌드: React 소스 → 정적 파일(dist/) ----
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build

# ---- 2) 실행: 정적 파일만 nginx 로 서빙 (Node.js·소스 미포함, non-root, :8080) ----
FROM nginxinc/nginx-unprivileged:1.27-alpine

# 빌드 시 Jenkins 가 커밋 ID 를 넣어줌 → 시작 시 config.json 에 기록
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}

COPY nginx.conf /etc/nginx/conf.d/default.conf
# nginx 이미지는 시작 전에 /docker-entrypoint.d/*.sh 를 실행 → 환경변수로 config.json 생성
COPY --chmod=0755 docker/40-app-config.sh /docker-entrypoint.d/40-app-config.sh
# config.json 을 시작 시 덮어써야 하므로 nginx 사용자(101) 소유로 복사
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html

EXPOSE 8080
