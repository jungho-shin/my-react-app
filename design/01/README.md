# DataCollector - React Application

이 프로젝트는 Express.js 백엔드와 React 프론트엔드로 구성된 데이터 수집 애플리케이션입니다.

## 기술 스택

- **Frontend**: React 18, React Router 6
- **Backend**: Express.js, MySQL
- **Build Tool**: Create React App

## 시작하기

### 사전 요구사항

- Node.js (v14 이상)
- npm 또는 yarn
- MySQL 데이터베이스

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 모드 실행

```bash
# 프론트엔드와 백엔드를 동시에 실행
npm run dev

# 또는 별도로 실행
npm run client  # React 개발 서버 (포트 3000)
npm run server  # Express 서버 (포트 7090)
```

### 프로덕션 빌드

```bash
# React 앱 빌드
npm run build

# 프로덕션 모드로 서버 실행
NODE_ENV=production npm start
```

## 프로젝트 구조

```
design/
├── src/                    # React 소스 코드
│   ├── components/         # React 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   ├── services/           # API 서비스
│   ├── App.js              # 메인 App 컴포넌트
│   └── index.js            # 진입점
├── public/                 # 정적 파일
├── routes/                 # Express 라우트
│   └── api/                # API 엔드포인트
├── lib/                    # 백엔드 라이브러리
├── app.js                  # Express 앱 설정
└── bin/www                 # 서버 시작 스크립트
```

## API 엔드포인트

- `/api/country` - 국가 관리
- `/api/datatypes` - 데이터 타입 관리
- `/api/timeunits` - 시간 단위 관리
- `/api/schedules` - 스케줄 관리
- `/api/taskstatus` - 작업 상태 관리
- `/api/privacypolicies` - 개인정보 처리방침 관리

## 환경 변수

`.env` 파일을 생성하여 다음 변수를 설정할 수 있습니다:

```
REACT_APP_API_URL=http://localhost:7090
PORT=7090
NODE_ENV=development
```

## 라이선스

Private
