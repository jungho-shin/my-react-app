# scraper-api

사내 웹 데이터 수집 서비스의 API + 수집 워커 (Python 3.12 + FastAPI). `samples/python-flask` 와 같은 구조.

| 폴더/파일 | GitLab / Argo CD | 내용 |
|---|---|---|
| `app-repo/` | `root/scraper-api` | 소스, 테스트, Dockerfile(Chromium 포함), Jenkinsfile |
| `deploy-repo/` | `root/scraper-api-deploy` | kustomize base + overlays (API dev 1개 / prod 2개, 워커 1개) |
| `argocd-apps.yaml` | `scraper-api-dev`, `scraper-api-prod` | Argo CD Application |

| 환경 | 네임스페이스 | 주소 |
|---|---|---|
| dev  | `scraper-api-dev`  | http://192.168.45.116:8280/scraper-api/ (문서: `/api/docs`) |
| prod | `scraper-api-prod` | http://192.168.45.116:8380/scraper-api/ |

이미지 하나를 두 가지로 실행한다.

| Deployment | 명령 | 역할 |
|---|---|---|
| `scraper-api` | `uvicorn app.main:app` | REST API, 미리보기·자동 감지 |
| `scraper-api-worker` | `python -m app.worker` | 대기열의 실행 수집, 예약 실행, 오래된 이력 정리, Webhook |

워커는 여러 개로 늘려도 같은 실행·예약을 두 번 처리하지 않는다 (DB 조건부 UPDATE 로 선점).

```
app/
  main.py  config.py  db.py  models.py  schemas.py  security.py  deps.py
  routers/   auth.py(계정·API 키·관리자)  bots.py(봇·미리보기·자동 감지)  runs.py(실행·데이터·내보내기·대시보드)
             mcp.py(MCP 서버: AI 도구용 JSON-RPC 창구, 위 함수들을 그대로 호출)
  engine/    netguard.py(내부망 차단)  fetch.py(HTTP/브라우저)  extract.py(선택자→값)  runner.py(페이지 순회)  detect.py(자동 감지)
  worker.py  schedule.py  jobs.py  exporter.py  templates.py
```

로컬 실행 (SQLite, 브라우저 렌더링 없이):

```bash
cd app-repo && python -m venv .venv && . .venv/bin/activate && pip install -r requirements-dev.txt
python -m pytest -q
uvicorn app.main:app --reload &        # http://127.0.0.1:8000/api/docs
python -m app.worker
```

설정은 환경변수 `SCRAPER_*` (`app/config.py`). 공개 값은 deploy 저장소 overlay 의 `configMapGenerator`,
비밀값(DB 주소, JWT 비밀, 관리자 계정)은 Secret `scraper-api` (`../setup.sh bootstrap`).
