# React Kubernetes App

Kubernetes에서 실행되는 React 애플리케이션 샘플입니다.

## 🚀 주요 기능

- ⏰ 실시간 시계
- 📊 Kubernetes 환경 정보 표시
- 📱 반응형 디자인
- 🐳 Docker 컨테이너화
- ☸️ Kubernetes 배포 준비

## 📁 프로젝트 구조

```
├── public/
│   └── index.html          # HTML 템플릿
├── src/
│   ├── App.js              # 메인 React 컴포넌트
│   ├── App.css             # 스타일시트
│   ├── index.js            # 앱 진입점
│   └── index.css           # 글로벌 스타일
├── k8s/                    # Kubernetes 매니페스트
│   ├── namespace.yaml      # 네임스페이스
│   ├── configmap.yaml      # 설정 맵
│   ├── deployment.yaml     # 배포
│   ├── service.yaml        # 서비스
│   ├── ingress.yaml        # 인그레스
│   ├── hpa.yaml           # 수평 Pod 오토스케일러
│   └── kustomization.yaml # Kustomize 설정
├── Dockerfile              # Docker 이미지 빌드
├── nginx.conf              # Nginx 설정
├── package.json            # Node.js 의존성
└── README.md              # 이 파일
```

## 🛠️ 로컬 개발

### 전제 조건
- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

브라우저에서 `http://localhost:3000`을 열어 앱을 확인할 수 있습니다.

## 🐳 Docker 빌드

```bash
# Docker 이미지 빌드
docker build -t react-k8s-app:latest .

# 로컬에서 실행 테스트
docker run -p 8080:80 react-k8s-app:latest
```

브라우저에서 `http://localhost:8080`으로 접속하여 테스트할 수 있습니다.

## ☸️ Kubernetes 배포

### 전제 조건
- Kubernetes 클러스터 (minikube, kind, 또는 클라우드)
- kubectl 설치 및 설정

### 배포 방법

#### 1. Kustomize 사용 (권장)

```bash
# 모든 리소스 배포
kubectl apply -k k8s/

# 배포 상태 확인
kubectl get all -n react-app
```

#### 2. 개별 파일 배포

```bash
# 네임스페이스 생성
kubectl apply -f k8s/namespace.yaml

# 설정 맵 생성
kubectl apply -f k8s/configmap.yaml

# 배포 생성
kubectl apply -f k8s/deployment.yaml

# 서비스 생성
kubectl apply -f k8s/service.yaml

# 인그레스 생성 (선택사항)
kubectl apply -f k8s/ingress.yaml

# HPA 생성 (선택사항)
kubectl apply -f k8s/hpa.yaml
```

### 접속 방법

#### 포트 포워딩 사용
```bash
kubectl port-forward -n react-app service/react-app-service 8080:80
```

브라우저에서 `http://localhost:8080`으로 접속

#### NodePort 서비스 사용
`k8s/service.yaml`을 다음과 같이 수정:

```yaml
spec:
  type: NodePort  # ClusterIP에서 NodePort로 변경
```

그 후 서비스에 할당된 NodePort로 접속:

```bash
kubectl get service -n react-app
```

#### Ingress 사용
Ingress Controller가 설치되어 있다면:

```bash
# hosts 파일에 추가 (Linux/Mac)
echo "127.0.0.1 react-app.local" | sudo tee -a /etc/hosts

# Windows는 C:\Windows\System32\drivers\etc\hosts 파일 편집
```

브라우저에서 `http://react-app.local`로 접속

### 모니터링 및 디버깅

```bash
# Pod 상태 확인
kubectl get pods -n react-app

# Pod 로그 확인
kubectl logs -n react-app -l app=react-app

# 서비스 확인
kubectl get service -n react-app

# 배포 상태 확인
kubectl get deployment -n react-app

# HPA 상태 확인 (HPA 배포한 경우)
kubectl get hpa -n react-app

# 상세 정보 확인
kubectl describe deployment react-app-deployment -n react-app
```

### 스케일링

```bash
# 수동 스케일링
kubectl scale deployment react-app-deployment --replicas=5 -n react-app

# HPA를 통한 자동 스케일링 (HPA 배포한 경우)
# CPU/메모리 사용률에 따라 자동으로 스케일링됩니다
```

### 정리

```bash
# 모든 리소스 삭제
kubectl delete -k k8s/

# 또는 개별 삭제
kubectl delete namespace react-app
```

## 🔧 환경 변수

앱에서 사용하는 환경 변수:

- `REACT_APP_POD_NAME`: Pod 이름
- `REACT_APP_NODE_NAME`: Node 이름  
- `REACT_APP_NAMESPACE`: Kubernetes 네임스페이스

이 변수들은 Kubernetes의 Downward API를 통해 자동으로 주입됩니다.

## 📝 추가 설정

### 리소스 제한
`k8s/deployment.yaml`에서 CPU/메모리 리소스를 조정할 수 있습니다:

```yaml
resources:
  requests:
    memory: "64Mi"
    cpu: "50m"
  limits:
    memory: "128Mi"
    cpu: "100m"
```

### 헬스체크
앱은 `/health` 엔드포인트를 통해 헬스체크를 수행합니다.

### 로그 레벨
Nginx 로그 레벨은 `nginx.conf`에서 조정할 수 있습니다.

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
