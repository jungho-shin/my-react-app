#!/bin/sh
# 컨테이너 시작 시 환경변수 → config.json
# React 는 빌드 시점에 굳어지므로, 같은 이미지를 dev/prod 에 쓰기 위해 실행 시점 설정을 파일로 제공한다.
#   APP_ENV      deploy 저장소 overlay 에서 지정 (dev / prod)
#   APP_VERSION  이미지 빌드 시 지정 (커밋 ID)
#   APP_MESSAGE  선택
set -eu
cat > /usr/share/nginx/html/config.json <<EOF
{"app":"scraper","env":"${APP_ENV:-local}","version":"${APP_VERSION:-dev}","pod":"$(hostname)","message":"${APP_MESSAGE:-사내 웹 데이터 수집}"}
EOF
echo "config.json: env=${APP_ENV:-local} version=${APP_VERSION:-dev}"
