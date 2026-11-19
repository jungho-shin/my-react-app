# scraper-deploy (GitOps)

Argo CD 가 감시하는 scraper 배포 저장소. **사람이 직접 배포하지 않고 이 저장소의 변경으로 배포한다.**

```
base/              공통 (Deployment, Service, Ingress)
overlays/dev/      scraper-dev  네임스페이스, 1개  → http://192.168.45.116:8280/scraper/
overlays/prod/     scraper-prod 네임스페이스, 2개  → http://192.168.45.116:8380/scraper/
```

- `newTag` 는 Jenkins 가 자동 변경 (dev: 빌드 직후, prod: 승인 후)
- 롤백: 해당 커밋을 `git revert` → Argo CD 가 이전 버전으로 되돌림
- 렌더링 확인: `kubectl kustomize overlays/dev`
