# scraper-api-deploy (GitOps)

Argo CD 가 감시하는 scraper-api 배포 저장소. **사람이 직접 배포하지 않고 이 저장소의 변경으로 배포한다.**

```
base/              공통 (Deployment scraper-api · scraper-api-worker, Service, Ingress)
overlays/dev/      scraper-api-dev  네임스페이스, API 1개 + 워커 1개 → http://192.168.45.116:8280/scraper-api/
overlays/prod/     scraper-api-prod 네임스페이스, API 2개 + 워커 1개 → http://192.168.45.116:8380/scraper-api/
```

- `newTag` 는 Jenkins 가 자동 변경 (dev: 빌드 직후, prod: 승인 후). API 와 워커가 같은 이미지를 쓴다
- 공개 설정은 overlay 의 `configMapGenerator` (수집 허용 내부 호스트, 시간대, 보관 이력 수 …)
- 비밀값 Secret `scraper-api` (DB 주소, JWT 비밀, 관리자 계정)는 이 저장소 밖 (`setup.sh bootstrap`)
- 롤백: 해당 커밋을 `git revert` → Argo CD 가 이전 버전으로 되돌림
- 렌더링 확인: `kubectl kustomize overlays/dev`
