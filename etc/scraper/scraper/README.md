# scraper (화면)

사내 웹 데이터 수집 서비스의 화면 (React 19 + Vite). 정적 파일을 nginx(non-root)로 서빙하고,
**같은 환경의 scraper-api** (`/scraper-api/api`)를 호출한다. `samples/react-vite` 와 같은 구조.

| 폴더/파일 | GitLab / Argo CD | 내용 |
|---|---|---|
| `app-repo/` | `root/scraper` | 소스, Vitest 테스트, Dockerfile(node 빌드 → nginx), Jenkinsfile |
| `deploy-repo/` | `root/scraper-deploy` | kustomize base + overlays(dev 1개 / prod 2개) |
| `argocd-apps.yaml` | `scraper-dev`, `scraper-prod` | Argo CD Application |

| 환경 | 네임스페이스 | 주소 |
|---|---|---|
| dev  | `scraper-dev`  | http://192.168.45.116:8280/scraper/ |
| prod | `scraper-prod` | http://192.168.45.116:8380/scraper/ |

```
src/
  App.jsx        틀(왼쪽 메뉴) + 주소(#/bots/3 ...)에 따른 화면 선택
  api.js         scraper-api 호출, 로그인 토큰, 파일 내려받기
  util.js        표시 형식·설정 정리 (순수 함수, util.test.js)
  ui.jsx         공통 부품 (표, 상태 표시, 내보내기 버튼 ...)
  pages/         Login · Dashboard · Bots · BotEditor · BotDetail · Runs · Settings(API 키, 사용자 관리)
```

로컬 개발: `npm ci && npm run dev` (API 는 dev 환경 `:8280/scraper-api` 로 전달 – `vite.config.js`).

**dev/prod 구분:** 이미지는 하나로 두고 컨테이너 시작 시 `APP_ENV`·`APP_VERSION` 으로 `config.json` 을 만들어
화면 왼쪽 아래에 표시한다 (`app-repo/docker/40-app-config.sh`).
