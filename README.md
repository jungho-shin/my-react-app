# React Docker App

Docker로 빌드 가능한 React 샘플 애플리케이션입니다. Vite와 React를 사용하여 구축되었으며, 멀티 스테이지 Docker 빌드를 통해 최적화된 프로덕션 이미지를 생성합니다.

## 🚀 기능

- ⚡️ Vite를 사용한 빠른 개발 환경
- 🐳 Docker 멀티 스테이지 빌드
- 📦 Nginx를 사용한 프로덕션 배포
- 🎨 현대적인 UI 디자인
- 🔄 SPA 라우팅 지원

## 📋 사전 요구사항

- Node.js 18 이상
- Docker 및 Docker Compose (Docker 사용 시)

## 🛠️ 설치 및 실행

### 로컬 개발 환경

1. 의존성 설치
```bash
npm install
```

2. 개발 서버 실행
```bash
npm run dev
```

개발 서버는 `http://localhost:3000`에서 실행됩니다.

### Docker를 사용한 빌드 및 실행

#### 방법 1: Docker Compose 사용 (권장)

```bash
# 이미지 빌드 및 컨테이너 실행
docker-compose up --build

# 백그라운드 실행
docker-compose up -d --build

# 컨테이너 중지
docker-compose down
```

#### 방법 2: Docker 직접 사용

```bash
# 이미지 빌드
docker build -t react-docker-app .

# 컨테이너 실행
docker run -p 3000:80 react-docker-app
```

브라우저에서 `http://localhost:3000`으로 접속하세요.

## 📁 프로젝트 구조

```
my-react-app/
├── src/
│   ├── App.jsx          # 메인 React 컴포넌트
│   ├── App.css          # 컴포넌트 스타일
│   ├── main.jsx         # 앱 진입점
│   └── index.css        # 전역 스타일
├── public/              # 정적 파일
├── Dockerfile           # Docker 빌드 설정
├── docker-compose.yml   # Docker Compose 설정
├── nginx.conf           # Nginx 설정 파일
├── vite.config.js       # Vite 설정
├── index.html           # HTML 템플릿
└── package.json         # 프로젝트 의존성
```

## 🐳 Docker 빌드 과정

이 프로젝트는 멀티 스테이지 빌드를 사용합니다:

1. **빌드 스테이지**: Node.js를 사용하여 React 앱을 빌드
2. **프로덕션 스테이지**: Nginx를 사용하여 빌드된 정적 파일을 서빙

이 방식으로 최종 이미지 크기를 최소화하고 보안을 강화합니다.

## 📝 사용 가능한 스크립트

- `npm run dev` - 개발 서버 실행
- `npm run build` - 프로덕션 빌드 생성
- `npm run preview` - 빌드된 앱 미리보기

## 🔧 환경 변수

환경 변수가 필요한 경우 `.env` 파일을 생성하여 설정할 수 있습니다.

## 📦 배포

### Docker Hub에 푸시

```bash
# 이미지 태그 지정
docker tag react-docker-app your-username/react-docker-app:latest

# Docker Hub에 푸시
docker push your-username/react-docker-app:latest
```

### 클라우드 플랫폼 배포

이 Docker 이미지는 다음 플랫폼에서 배포할 수 있습니다:
- AWS ECS/Fargate
- Google Cloud Run
- Azure Container Instances
- Heroku
- DigitalOcean App Platform

## 🛡️ 보안 고려사항

- `.dockerignore` 파일을 통해 불필요한 파일이 이미지에 포함되지 않도록 설정
- 멀티 스테이지 빌드로 최소한의 의존성만 포함
- Nginx를 사용한 안전한 정적 파일 서빙

## 📄 라이선스

이 프로젝트는 샘플 프로젝트입니다.

## 🤝 기여

이슈나 개선 사항이 있으면 언제든지 제안해주세요!

