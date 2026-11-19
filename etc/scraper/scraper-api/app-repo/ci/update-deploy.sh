#!/bin/sh
# deploy 저장소(GitOps)의 overlays/<env> 이미지 태그를 $TAG 로 바꾸고 push
# 사용: sh ci/update-deploy.sh dev|prod
# 필요 환경변수: APP, TAG, DEPLOY_REPO, GL_USER, GL_TOKEN (Jenkins 가 주입)
set -eu
ENV="$1"
DIR=$(mktemp -d)
trap 'rm -rf "$DIR"' EXIT

git clone -q "http://${GL_USER}:${GL_TOKEN}@${DEPLOY_REPO}" "$DIR"
cd "$DIR"
git config user.name  "jenkins"
git config user.email "jenkins@infra.local"

FILE="overlays/${ENV}/kustomization.yaml"
sed -i "s|newTag: .*|newTag: \"${TAG}\"|" "$FILE"

if git diff --quiet; then
  echo "[${ENV}] 이미 ${TAG} - 변경 없음"
  exit 0
fi

git commit -qam "deploy(${ENV}): ${APP} ${TAG}"
# 동시에 다른 커밋이 들어온 경우 대비 1회 rebase 재시도
git push -q origin HEAD:main || { git pull -q --rebase origin main && git push -q origin HEAD:main; }
echo "[${ENV}] ${APP} 이미지 태그 → ${TAG} (Argo CD 가 최대 3분 내 반영)"
