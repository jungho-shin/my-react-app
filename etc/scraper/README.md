# scraper – 사내 웹 데이터 수집 서비스

웹 페이지의 목록·가격·게시글을 **코드 없이** 모아 Excel / API / Webhook 으로 내보내는 사내용 서비스.
사내 전용이라 요금·크레딧·사용량 제한이 없다. `infra/samples` 와 같은 구조로 infra 의 CI/CD
(GitLab → Jenkins → Nexus → Argo CD)를 통해 dev / prod 에 배포된다.

```
사용자 ──▶ scraper (화면) ──▶ scraper-api (API) ──▶ PostgreSQL scraper_dev / scraper_prod
(브라우저)  :8280/scraper/      /scraper-api/api          ▲
                                                          │ 대기열(runs) · 결과(items)
외부 시스템 ──X-API-Key──▶ scraper-api          scraper-api-worker ──▶ 수집 대상 사이트
(BI, 배치)                                       (예약 실행, HTTP / 헤드리스 Chromium)
```

| 앱 | 스택 | 기준 샘플 | dev | prod |
|---|---|---|---|---|
| [scraper](scraper/) | React 19 + Vite → nginx | `samples/react-vite` | http://192.168.45.116:8280/scraper/ | http://192.168.45.116:8380/scraper/ |
| [scraper-api](scraper-api/) | Python 3.12 + FastAPI + 수집 워커 | `samples/python-flask` | http://192.168.45.116:8280/scraper-api/api/docs | http://192.168.45.116:8380/scraper-api/api/docs |

## 할 수 있는 것

| 기능 | 설명 |
|---|---|
| 수집 봇 | 시작 주소 + 목록 선택자 + 필드(글자·숫자·링크·이미지·속성)만 정하면 봇 1개. CSS 선택자가 기본, `//` 로 시작하면 XPath |
| 자동 감지 | 주소만 넣으면 페이지에서 반복되는 묶음(상품 카드, 게시글 행)을 찾아 선택자와 필드를 제안 |
| 미리보기 | 저장 전에 첫 페이지에서 최대 20건을 바로 수집해 확인 |
| 페이지 넘김 | ‘다음’ 링크 따라가기 / 주소의 `{page}` 번호 바꾸기 |
| 상세 페이지 | 목록의 링크를 따라 들어가 추가 필드를 붙임 |
| 브라우저 렌더링 | JavaScript 로 그려지는 페이지는 헤드리스 Chromium 으로 렌더링 후 추출 (요소 대기, 스크롤) |
| 예약 | 일정 간격 / 매일 정해진 시각 / cron (Asia/Seoul) |
| 신규 표시 | 기준 필드가 이전 실행에 없던 데이터만 ‘신규’ 로 표시·내보내기 (가격·게시글 모니터링) |
| 이미 수집한 데이터 건너뛰기 | 봇 설정 `skip_known`: 기준 필드가 이전 실행에 있던 데이터는 저장하지 않고 상세 페이지도 열지 않음. 최대 건수는 ‘살펴볼 건수’ (예: 상위 10건 중 새 것만) |
| 내보내기 | Excel(xlsx) · CSV · JSON, 최신 결과 고정 주소(`/bots/{id}/latest/...`) |
| API · Webhook | API 키(`X-API-Key`)로 실행·조회, 실행이 끝나면 결과를 Webhook 으로 POST |
| MCP 서버 | Claude 같은 AI 도구가 scraper 를 도구로 호출 (`/scraper-api/api/mcp`): 봇 목록·실행·데이터 조회, 자동 감지 → 미리보기 → 봇 저장 |
| 템플릿 | 상품 목록, 목록→상세, 페이지 번호, JS 렌더링, 표, 페이지 정보 (예제 사이트로 바로 실행 가능) |

계정은 화면에서 직접 만든다 (첫 가입자와 `admin` 이 관리자). 봇은 모든 사용자가 보고 실행할 수 있고,
수정·삭제는 만든 사람과 관리자만 가능하다.

## MCP 서버

화면의 "API · 연동"에서 API 키를 만든 뒤 AI 도구에 등록한다. Claude Code 예:

```bash
claude mcp add --transport http scraper http://192.168.45.116:8280/scraper-api/api/mcp --header "X-API-Key: usk_..."
```

| 도구 | 하는 일 |
|---|---|
| `list_bots` · `get_bot` | 봇 목록 / 봇 하나의 설정 |
| `run_bot` · `get_run` | 수집 실행(끝날 때까지 최대 120초 대기) / 실행 상태와 로그 |
| `get_items` | 수집 데이터 (최근 성공한 실행 또는 지정한 실행, 신규만 가능) |
| `list_templates` · `detect_page` · `preview_config` · `create_bot` | 새 봇 만들기: 예시 → 선택자 후보 → 첫 페이지 수집 확인 → 저장 |

세션과 스트림이 없는 요청-응답 방식(Streamable HTTP, JSON 응답)이라 API Pod 가 여러 개여도 그대로 동작한다.
권한·입력 검증·내부망 차단은 REST API 와 같다. 봇 수정·삭제는 도구로 제공하지 않는다 (화면에서만).

## 수집 대상 제한

- **내부망 주소는 기본적으로 수집할 수 없다.** 워커가 클러스터 안에서 돌기 때문에, 막지 않으면 화면에 입력한 주소로
  GitLab·DB·Kubernetes API 같은 내부 서비스를 읽을 수 있다. 사내 사이트를 수집해야 하면
  `scraper-api/deploy-repo/overlays/<env>/kustomization.yaml` 의 `SCRAPER_ALLOW_HOSTS` 에 그 호스트만 추가한다.
- `robots.txt` 를 따르고(봇마다 끌 수 있음) 요청 사이에 최소 0.3초를 둔다. 대상 사이트의 이용 약관은 봇을 만드는 사람이 확인한다.

## 구성 순서

```bash
# [사전] infra 쪽: ./infra/samples/setup.sh registry, 샘플 앱 1개 이상 구성
./setup.sh all                    # 아래를 한 번에: bootstrap → (gitlab → argocd → jenkins) × 2
#   또는 단계별로
./setup.sh bootstrap              # PostgreSQL DB, Secret scraper-api
./setup.sh gitlab  scraper-api    # 이하 scraper 도 동일
./setup.sh argocd  scraper-api
./setup.sh jenkins scraper-api    # 첫 빌드 시작 → dev 배포 → Jenkins 에서 승인 → prod
./setup.sh status  scraper-api
```

코드를 고친 뒤에는 `./setup.sh push all -m "메시지"` (GitLab 에 push → Jenkins 가 빌드, dev 자동 배포).

| 항목 | 이름 |
|---|---|
| GitLab 프로젝트 | `root/scraper`, `root/scraper-deploy`, `root/scraper-api`, `root/scraper-api-deploy` |
| 이미지 | `192.168.45.116:5000/scraper:<커밋>`, `192.168.45.116:5000/scraper-api:<커밋>` |
| Jenkins Job | `scraper`, `scraper-api` |
| 네임스페이스 / Argo CD App | `scraper-dev`, `scraper-prod`, `scraper-api-dev`, `scraper-api-prod` |
| DB (database/postgresql) | 사용자 `scraper`, DB `scraper_dev`, `scraper_prod` |
| 비밀값 | `./.secrets.env` (DB 비밀번호, JWT 비밀, 관리자 `admin` 비밀번호) · 공용 토큰은 `infra/samples/.secrets.env` |
