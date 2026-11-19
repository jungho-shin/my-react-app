#!/usr/bin/env bash
# scraper(사내 웹 데이터 수집 서비스) CI/CD 구성. 서버 192.168.45.116 에서 실행하며 재실행해도 안전.
# infra/samples/setup.sh 와 같은 방식이고, infra/ 는 읽기만 한다
#   (config.env, samples/.secrets.env 의 GITLAB_TOKEN·NEXUS_CI_PASSWORD, samples/jenkins-job.groovy).
#
#   [사전] ./infra/samples/setup.sh registry 와 샘플 앱 하나 이상의 gitlab 단계가 끝나 있어야 함
#
#   ./setup.sh bootstrap            최초 1회 (재실행 시 비밀번호 유지)
#        - PostgreSQL 사용자 scraper, DB scraper_dev / scraper_prod
#        - 네임스페이스 scraper-api-dev/prod 의 Secret scraper-api (DB 주소, JWT 비밀, 관리자 계정)
#
#   [앱마다]  <app> = scraper-api (API + 수집 워커) | scraper (화면)
#   ./setup.sh gitlab  <app>        GitLab root/<app>, root/<app>-deploy 생성 + 소스 push + webhook
#   ./setup.sh jenkins <app>        Jenkins 파이프라인 Job <app> + 첫 빌드 시작
#   ./setup.sh argocd  <app>        네임스페이스 <app>-dev/<app>-prod + Argo CD Application
#   ./setup.sh status  <app>        상태 확인
#
#   [코드 변경 반영]  <app> 대신 all 이면 두 앱 모두
#   ./setup.sh push <app> [-m 메시지] [-y]
#        로컬 <app>/{app-repo,deploy-repo} 변경분을 GitLab 에 커밋·push → Jenkins 빌드
#        (변경 파일 목록을 보여주고 확인 후 push, -y 는 확인 생략. 배포된 이미지 태그는 유지)
#
#   ./setup.sh all                  bootstrap + 두 앱의 gitlab · jenkins · argocd
#
# Jenkins admin 비밀번호: 환경변수 JENKINS_ADMIN_PASSWORD → 클러스터 Secret cicd/jenkins → 직접 입력 순으로 찾는다.
# 이 스크립트가 만든 비밀값은 ./.secrets.env (권한 600, git 제외)에 저장된다.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
INFRA="${INFRA_DIR:-$HOME/workspace/infra}"
[[ -f "$INFRA/config.env" ]] || { echo "infra 폴더를 찾을 수 없습니다: $INFRA (INFRA_DIR 로 지정)" >&2; exit 1; }
source "$INFRA/config.env"

K="kubectl --context kind-infra"
REG="$HOST_IP:5000"
SECRETS="$HERE/.secrets.env"
SAMPLE_SECRETS="$INFRA/samples/.secrets.env"
GL_URL="http://127.0.0.1:8929"     # 호스트 프록시 경유
JK_URL="http://127.0.0.1:8180"
GL_INTERNAL="http://gitlab.cicd.svc.cluster.local/root"   # 클러스터 내부(Jenkins, Argo CD)에서 쓰는 주소
JK_INTERNAL_HOST="jenkins.cicd.svc.cluster.local"          # GitLab webhook 이 호출할 Jenkins 내부 주소
APPS=(scraper-api scraper)                                 # API 를 먼저 (화면이 API 를 부름)
EXCLUDES=(--exclude=.git --exclude=node_modules --exclude=dist --exclude=.venv --exclude=__pycache__
          --exclude=.pytest_cache --exclude='*.db')

log()  { echo -e "\n\033[1;34m==> $*\033[0m"; }
ok()   { echo "  ✓ $*"; }
warn() { echo "  ! $*"; }
die()  { echo "  ✗ $*" >&2; exit 1; }
load() {
  if [[ -f "$SAMPLE_SECRETS" ]]; then source "$SAMPLE_SECRETS"; fi   # GITLAB_TOKEN, NEXUS_CI_PASSWORD (infra 소유, 읽기만)
  if [[ -f "$SECRETS" ]]; then source "$SECRETS"; fi
}
save() { # KEY VALUE
  touch "$SECRETS"; chmod 600 "$SECRETS"
  { grep -v "^$1=" "$SECRETS" || true; echo "$1=$2"; } > "$SECRETS.tmp"
  mv "$SECRETS.tmp" "$SECRETS"; chmod 600 "$SECRETS"
}
rand() { openssl rand -hex "${1:-16}"; }
json() { python3 -c "import json,sys; d=json.load(sys.stdin); print($1)"; }
need_app() {
  [[ -n "${APP:-}" ]] || die "앱 이름이 필요합니다. 예: $0 $CMD scraper-api   (가능: ${APPS[*]})"
  [[ -d "$HERE/$APP/app-repo" && -d "$HERE/$APP/deploy-repo" ]] || die "$APP/{app-repo,deploy-repo} 가 없습니다"
}
need_secrets() {
  load
  [[ -n "${NEXUS_CI_PASSWORD:-}" ]] || die "먼저 ./infra/samples/setup.sh registry 를 실행하세요 (Nexus ci 계정)"
  [[ -n "${GITLAB_TOKEN:-}" ]]      || die "먼저 ./infra/samples/setup.sh gitlab <샘플앱> 을 실행하세요 (GitLab 토큰)"
  [[ $(gl -o /dev/null -w '%{http_code}' "$GL_URL/api/v4/user") == 200 ]] || die "GitLab 토큰이 유효하지 않습니다 ($SAMPLE_SECRETS)"
}
gl() { curl -s -H "PRIVATE-TOKEN: $GITLAB_TOKEN" "$@"; }

jenkins_login() { # → JKP, CJ(쿠키 파일), CRUMB
  if [[ -z "${JKP:-}" ]]; then
    JKP="${JENKINS_ADMIN_PASSWORD:-}"
    [[ -n "$JKP" ]] || JKP=$($K -n cicd get secret jenkins -o jsonpath='{.data.jenkins-admin-password}' 2>/dev/null | base64 -d || true)
    [[ -n "$JKP" ]] || { read -rsp "  Jenkins admin 비밀번호: " JKP; echo; }
  fi
  CJ=$(mktemp)
  CRUMB=$(curl -sf -c "$CJ" -u "admin:$JKP" "$JK_URL/crumbIssuer/api/json" \
          | json 'd["crumbRequestField"] + ":" + d["crumb"]') || { rm -f "$CJ"; die "Jenkins 로그인 실패 - 비밀번호 확인"; }
}

# ================================================================ bootstrap
bootstrap() {
  load
  log "PostgreSQL: 사용자 scraper · DB scraper_dev / scraper_prod"
  local PG="$K -n database exec postgresql-0 -- psql -v ON_ERROR_STOP=1 -U postgres -tA"
  local DBP="${SCRAPER_DB_PASSWORD:-$(rand 16)}"
  $PG -c "DO \$\$ BEGIN
            IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'scraper') THEN CREATE ROLE scraper LOGIN PASSWORD '$DBP';
            ELSE ALTER ROLE scraper PASSWORD '$DBP'; END IF; END \$\$;" >/dev/null
  save SCRAPER_DB_PASSWORD "$DBP"
  ok "사용자 scraper"
  local db
  for db in scraper_dev scraper_prod; do
    if [[ $($PG -c "SELECT 1 FROM pg_database WHERE datname = '$db'") == 1 ]]; then ok "DB $db 이미 존재"
    else $PG -c "CREATE DATABASE $db OWNER scraper" >/dev/null; ok "DB $db 생성"; fi
  done

  log "Secret scraper-api (scraper-api-dev / scraper-api-prod)"
  local env jwt admin_pw
  admin_pw="${SCRAPER_ADMIN_PASSWORD:-$(rand 8)}"; save SCRAPER_ADMIN_PASSWORD "$admin_pw"
  for env in dev prod; do
    jwt=$(eval echo "\${SCRAPER_JWT_SECRET_${env^^}:-}"); jwt="${jwt:-$(rand 32)}"; save "SCRAPER_JWT_SECRET_${env^^}" "$jwt"
    $K create namespace "scraper-api-$env" --dry-run=client -o yaml | $K apply -f - >/dev/null
    $K -n "scraper-api-$env" create secret generic scraper-api \
      --from-literal=SCRAPER_DATABASE_URL="postgresql+psycopg://scraper:${DBP}@postgresql.database.svc.cluster.local:5432/scraper_${env}" \
      --from-literal=SCRAPER_JWT_SECRET="$jwt" \
      --from-literal=SCRAPER_ADMIN_USERNAME=admin \
      --from-literal=SCRAPER_ADMIN_PASSWORD="$admin_pw" \
      --dry-run=client -o yaml | $K apply -f - >/dev/null
    ok "scraper-api-$env/scraper-api"
  done
  echo "  → 관리자 계정: admin / (.secrets.env 의 SCRAPER_ADMIN_PASSWORD)"
  echo "    Secret 을 바꾼 뒤에는: $K -n scraper-api-<env> rollout restart deploy/scraper-api deploy/scraper-api-worker"
}

# ================================================================ gitlab <app>
push_repo() { # 로컬 폴더 → GitLab root/<project> main (이미 main 이 있으면 건너뜀: 배포 이력 보호)
  local src=$1 proj=$2 tmp
  if [[ $(gl -o /dev/null -w '%{http_code}' "$GL_URL/api/v4/projects/root%2F$proj/repository/branches/main") == 200 ]]; then
    ok "$proj: main 브랜치 이미 있음 - push 생략 (변경은 '$0 push $APP')"; return 0
  fi
  tmp=$(mktemp -d)
  tar -C "$src" "${EXCLUDES[@]}" -cf - . | tar -C "$tmp" -xf -
  git -C "$tmp" init -q -b main
  git -C "$tmp" add -A
  git -C "$tmp" -c user.name=root -c user.email=root@infra.local commit -qm "initial commit"
  git -C "$tmp" push -q "http://root:${GITLAB_TOKEN}@127.0.0.1:8929/root/$proj.git" main
  rm -rf "$tmp"
  ok "$proj: 소스 push 완료"
}

gitlab() {
  need_app; need_secrets
  log "GitLab: root/$APP, root/$APP-deploy"
  local proj src
  for proj in "$APP-deploy" "$APP"; do      # deploy 저장소 먼저 → 첫 빌드가 태그를 바꿀 곳이 준비됨
    if [[ $proj == "$APP" ]]; then src="$HERE/$APP/app-repo"; else src="$HERE/$APP/deploy-repo"; fi
    if [[ $(gl -o /dev/null -w '%{http_code}' "$GL_URL/api/v4/projects/root%2F$proj") == 200 ]]; then
      ok "프로젝트 root/$proj 이미 존재"
    else
      gl -f -o /dev/null -X POST "$GL_URL/api/v4/projects" \
        --data-urlencode "name=$proj" -d visibility=private -d default_branch=main
      ok "프로젝트 root/$proj 생성"
    fi
    push_repo "$src" "$proj"
  done

  # GitLab push → Jenkins git 플러그인 notifyCommit (해당 저장소를 쓰는 Job 이 새 커밋이면 빌드)
  local hook_url="http://${JK_INTERNAL_HOST}:8080/git/notifyCommit?url=${GL_INTERNAL}/${APP}.git" hooks hook_id
  hooks=$(gl "$GL_URL/api/v4/projects/root%2F$APP/hooks")
  hook_id=$(json 'next((str(h["id"]) for h in d if h["url"]=="'"$hook_url"'"), "")' <<<"$hooks")
  if [[ -n "$hook_id" ]]; then ok "webhook 이미 등록 (id $hook_id)"
  else
    gl -f -o /dev/null -X POST "$GL_URL/api/v4/projects/root%2F$APP/hooks" \
      --data-urlencode "url=$hook_url" -d push_events=true -d push_events_branch_filter=main -d enable_ssl_verification=false
    ok "webhook 등록: push(main) → $hook_url"
  fi
  echo "  → http://$HOST_IP:8929/root/$APP , http://$HOST_IP:8929/root/$APP-deploy"
}

# ================================================================ jenkins <app>
jenkins() {
  need_app; need_secrets
  log "Jenkins: 파이프라인 Job '$APP' (infra/samples/jenkins-job.groovy 템플릿 사용)"
  jenkins_login
  local script out
  script=$(sed -e "s|@@APP@@|$APP|g" -e "s|@@GITLAB_TOKEN@@|$GITLAB_TOKEN|" -e "s|@@NEXUS_PW@@|$NEXUS_CI_PASSWORD|" \
           "$INFRA/samples/jenkins-job.groovy")
  out=$(curl -s -b "$CJ" -u "admin:$JKP" -H "$CRUMB" --data-urlencode "script=$script" "$JK_URL/scriptText")
  sed 's/^/  /' <<<"$out"
  grep -q '^OK' <<<"$out" || { rm -f "$CJ"; die "Jenkins 설정 실패"; }
  first_build
  rm -f "$CJ"
  echo "  → http://$HOST_IP:8180/job/$APP/"
}

# Pipeline Job 은 한 번도 빌드되지 않았으면 GitLab webhook(notifyCommit)이 와도 빌드하지 않는다
# (첫 빌드에서 Jenkinsfile 을 읽어야 감시할 저장소를 알게 됨) → 빌드 이력이 없으면 첫 빌드를 시작
first_build() {
  local info
  info=$(curl -s -b "$CJ" -u "admin:$JKP" "$JK_URL/job/$APP/api/json?tree=lastBuild%5Bnumber%5D,inQueue")
  if json 'd.get("lastBuild") is None and not d.get("inQueue")' <<<"$info" | grep -q True; then
    if [[ $(curl -s -b "$CJ" -u "admin:$JKP" -H "$CRUMB" -o /dev/null -w '%{http_code}' -X POST "$JK_URL/job/$APP/build") == 201 ]]; then
      ok "$APP: 첫 빌드 시작 (이후에는 main push 시 자동 빌드)"
    else
      warn "$APP: 첫 빌드 요청 실패 - Jenkins 에서 '지금 빌드' 를 눌러 주세요"
    fi
  else
    ok "$APP: 빌드 이력 있음 - push 시 webhook 으로 자동 빌드"
  fi
}

# ================================================================ argocd <app>
argocd() {
  need_app; need_secrets
  log "Argo CD: 네임스페이스 $APP-dev/$APP-prod · Application"
  local ns
  for ns in "$APP-dev" "$APP-prod"; do
    $K create namespace "$ns" --dry-run=client -o yaml | $K apply -f -
    $K -n "$ns" create secret docker-registry nexus-pull --docker-server="$REG" \
      --docker-username=ci --docker-password="$NEXUS_CI_PASSWORD" --dry-run=client -o yaml | $K apply -f -
  done
  # GitLab root/ 아래 저장소 공용 자격증명 repo-creds-gitlab-root 은 samples 가 만들어 둔 것을 그대로 쓴다
  $K -n argocd get secret repo-creds-gitlab-root >/dev/null 2>&1 \
    || die "Argo CD 자격증명 repo-creds-gitlab-root 가 없습니다 - ./infra/samples/setup.sh argocd <샘플앱> 을 먼저 실행하세요"
  if [[ $APP == scraper-api ]]; then
    $K -n scraper-api-dev get secret scraper-api >/dev/null 2>&1 || die "Secret scraper-api 가 없습니다 - 먼저 '$0 bootstrap'"
  fi
  $K apply -f "$HERE/$APP/argocd-apps.yaml"
  echo "  → http://$HOST_IP:8190/applications"
}

# ================================================================ push <app>
# 로컬 <app>/{app-repo,deploy-repo} 의 변경분을 GitLab root/<app>, root/<app>-deploy main 에 커밋·push.
#  - GitLab 저장소를 로컬 폴더 내용과 같게 맞춤 (로컬에서 지운 파일은 GitLab 에서도 삭제)
#  - deploy 저장소 overlays/*/kustomization.yaml 의 newTag 는 GitLab 값을 유지 (Jenkins 가 배포한 이미지 태그)
#  - app 저장소 push → webhook 으로 Jenkins 빌드 (dev 자동 배포, prod 는 승인 후)
sync_repo() { # <로컬 폴더> <GitLab 프로젝트> app|deploy <커밋 메시지>
  local src=$1 proj=$2 kind=$3 msg=$4 tmp R f line esc
  tmp=$(mktemp -d); R="$tmp/repo"
  git clone -q "http://root:${GITLAB_TOKEN}@127.0.0.1:8929/root/$proj.git" "$R" 2>/dev/null \
    || { rm -rf "$tmp"; die "$proj: clone 실패 - 먼저 '$0 gitlab $APP' 를 실행하세요"; }

  local -A tags=()
  if [[ $kind == deploy ]]; then
    for f in "$R"/overlays/*/kustomization.yaml; do
      [[ -f $f ]] && tags["${f#"$R"/}"]=$(grep -m1 -E '^[[:space:]]*newTag:' "$f" || true)
    done
  fi

  find "$R" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
  tar -C "$src" "${EXCLUDES[@]}" -cf - . | tar -C "$R" -xf -

  for f in "${!tags[@]}"; do
    line=${tags[$f]}
    [[ -f "$R/$f" && -n $line ]] || continue
    esc=$(printf '%s' "$line" | sed 's/[&|\\]/\\&/g')
    sed -i "s|^[[:space:]]*newTag:.*|$esc|" "$R/$f"
  done

  git -C "$R" add -A
  if git -C "$R" diff --cached --quiet; then
    ok "root/$proj: 변경 없음"; rm -rf "$tmp"; return 0
  fi
  echo "  root/$proj 변경:"
  git -C "$R" diff --cached --stat | sed 's/^/    /'
  if [[ $YES != 1 ]]; then
    local answer
    read -rp "  root/$proj 에 push 할까요? [y/N] " answer
    [[ $answer == [yY]* ]] || { warn "root/$proj: 건너뜀"; rm -rf "$tmp"; return 0; }
  fi
  git -C "$R" -c user.name=root -c user.email=root@infra.local commit -qm "$msg"
  # Jenkins 가 그 사이 deploy 저장소에 태그를 커밋했을 수 있음 → 1회 rebase 재시도
  git -C "$R" push -q origin HEAD:main \
    || { git -C "$R" pull -q --rebase origin main && git -C "$R" push -q origin HEAD:main; } \
    || { rm -rf "$tmp"; die "root/$proj: push 실패"; }
  rm -rf "$tmp"
  ok "root/$proj: push 완료"
}

push_one() {
  need_app; need_secrets
  log "push: $APP → root/$APP, root/$APP-deploy"
  local msg="${MSG:-update ($(date '+%Y-%m-%d %H:%M'))}"
  sync_repo "$HERE/$APP/deploy-repo" "$APP-deploy" deploy "$msg"   # 설정 먼저 → 이후 빌드가 새 설정으로 배포
  sync_repo "$HERE/$APP/app-repo"    "$APP"        app    "$msg"
  echo "  → 빌드: http://$HOST_IP:8180/job/$APP/   (dev 자동 배포, prod 는 승인)"
}

push() {
  if [[ $APP == all ]]; then
    local a
    for a in "${APPS[@]}"; do APP=$a; push_one; done
  else
    push_one
  fi
}

# ================================================================ status <app>
status() {
  need_app
  log "Argo CD Application"
  $K -n argocd get applications.argoproj.io "$APP-dev" "$APP-prod" \
    -o custom-columns=NAME:.metadata.name,SYNC:.status.sync.status,HEALTH:.status.health.status,REVISION:.status.sync.revision 2>/dev/null || true
  log "Pod"
  $K get pods -n "$APP-dev" -o wide 2>/dev/null || true
  $K get pods -n "$APP-prod" -o wide 2>/dev/null || true
  log "응답"
  local p path="config.json"
  [[ $APP == scraper-api ]] && path=""
  for p in 8280 8380; do echo "  :$p/$APP/$path → $(curl -s --max-time 5 "http://$HOST_IP:$p/$APP/$path" | head -c 300 || echo '(응답 없음)')"; done
}

all() {
  bootstrap
  for APP in "${APPS[@]}"; do gitlab; argocd; jenkins; done
  echo
  echo "  첫 빌드가 끝나면 (dev 자동 배포, prod 는 Jenkins 에서 승인):"
  echo "    dev  http://$HOST_IP:8280/scraper/"
  echo "    prod http://$HOST_IP:8380/scraper/"
}

CMD="${1:-}"; APP="${2:-}"
shift $(( $# < 2 ? $# : 2 ))
MSG=""; YES=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    -m) [[ $# -ge 2 ]] || die "-m 뒤에 커밋 메시지가 필요합니다"; MSG=$2; shift 2 ;;
    -y) YES=1; shift ;;
    *)  die "알 수 없는 옵션: $1" ;;
  esac
done
case "$CMD" in
  bootstrap|gitlab|jenkins|argocd|push|status|all) "$CMD" ;;
  *) sed -n '2,26p' "$0"; exit 1 ;;
esac
