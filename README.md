# 메모관리 웹 애플리케이션

Docker 환경에서 실행되는 간단한 메모관리 웹 애플리케이션입니다.

## 🚀 빠른 시작

### 필요한 것
- Docker
- Docker Compose

### 실행 방법

1. 환경 변수 파일 설정
```bash
# .env.example을 참고하여 .env 파일 생성 (또는 기본값 사용)
cp .env.example .env
```

2. Docker Compose로 서비스 실행
```bash
docker-compose up
```

3. 브라우저에서 접속
```
http://localhost
```

## 📁 프로젝트 구조

```
docker_test/
├── backend/                 # Node.js 백엔드 API
│   ├── src/
│   │   ├── app.js          # 메인 애플리케이션
│   │   ├── db.js           # 데이터베이스 연결
│   │   ├── routes/         # API 라우트
│   │   ├── controllers/    # 비즈니스 로직
│   │   └── models/         # 데이터 모델
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/                # Nginx 프론트엔드
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   ├── nginx.conf
│   └── Dockerfile
├── database/                # MySQL 초기화
│   └── init.sql
├── docker-compose.yml
├── .env.example
└── .env
```

## 🔧 서비스 정보

### 백엔드 API
- **URL**: http://localhost:3000
- **언어**: Node.js (Express)
- **포트**: 3000

### 프론트엔드
- **URL**: http://localhost
- **웹서버**: Nginx
- **포트**: 80

### 데이터베이스
- **엔진**: MySQL 8.0
- **호스트**: db (Docker 네트워크 내)
- **포트**: 3306
- **데이터베이스명**: memos_db

## 📝 API 엔드포인트

### 메모 목록 조회
```
GET /api/memos
```

### 메모 상세 조회
```
GET /api/memos/:id
```

### 메모 생성
```
POST /api/memos
Content-Type: application/json

{
  "title": "메모 제목",
  "content": "메모 내용"
}
```

### 메모 수정
```
PUT /api/memos/:id
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```

### 메모 삭제
```
DELETE /api/memos/:id
```

## 🐳 Docker 명령어

### 서비스 시작
```bash
# 포그라운드에서 실행
docker-compose up

# 백그라운드에서 실행
docker-compose up -d

# 재빌드하여 실행
docker-compose up --build
```

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f backend
docker-compose logs -f db
docker-compose logs -f frontend
```

### 서비스 종료
```bash
# 컨테이너 종료
docker-compose down

# 컨테이너 + 볼륨 삭제
docker-compose down -v
```

### 특정 서비스 재시작
```bash
docker-compose restart backend
docker-compose restart db
docker-compose restart frontend
```

## 🧪 테스트

### API 테스트 (curl)

```bash
# 메모 목록 조회
curl http://localhost:3000/api/memos

# 메모 생성
curl -X POST http://localhost:3000/api/memos \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트","content":"테스트 내용"}'

# 메모 수정
curl -X PUT http://localhost:3000/api/memos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"수정됨","content":"수정된 내용"}'

# 메모 삭제
curl -X DELETE http://localhost:3000/api/memos/1
```

### 데이터베이스 확인

```bash
# MySQL 접속
docker-compose exec db mysql -u memouser -p memos_db

# 또는 root로 접속
docker-compose exec db mysql -u root -p

# 테이블 확인
SHOW TABLES;
SELECT * FROM memos;
```

## 🔐 환경 변수

`.env` 파일에서 설정할 수 있는 변수들:

| 변수 | 기본값 | 설명 |
|------|--------|------|
| DB_HOST | db | 데이터베이스 호스트 |
| DB_PORT | 3306 | 데이터베이스 포트 |
| DB_NAME | memos_db | 데이터베이스 이름 |
| DB_USER | memouser | 데이터베이스 사용자 |
| DB_PASSWORD | memopass | 데이터베이스 비밀번호 |
| DB_ROOT_PASSWORD | root | MySQL root 비밀번호 |
| NODE_ENV | development | Node.js 환경 |
| PORT | 3000 | 백엔드 포트 |

## 🏗️ 백엔드 아키텍처

### 계층 구조
```
Express App
  ├── Routes (routes/memos.js)
  │   └── Controllers (controllers/memoController.js)
  │       └── Models (models/Memo.js)
  │           └── Database Pool (db.js)
  │               └── MySQL
```

### 파일 설명
- **`src/app.js`**: Express 애플리케이션 초기화, 미들웨어, 라우트 마운트
- **`src/db.js`**: MySQL 연결 풀 생성 및 관리
- **`src/models/Memo.js`**: 데이터베이스 쿼리 (findAll, findById, create, update, delete)
- **`src/controllers/memoController.js`**: 요청 처리 및 응답 반환
- **`src/routes/memos.js`**: API 라우트 정의

## 🎨 프론트엔드 기능

### 주요 기능
- ✅ 메모 목록 조회 (실시간 업데이트)
- ✅ 메모 선택 및 상세 보기
- ✅ 메모 생성 (제목 + 내용)
- ✅ 메모 수정 (선택한 메모 편집)
- ✅ 메모 삭제 (확인 다이얼로그)
- ✅ 글자 수 카운팅
- ✅ 시간 포맷팅 (방금 전, N분 전, etc)
- ✅ 반응형 디자인 (모바일/태블릿/데스크톱)

### 파일 구조
- **`frontend/index.html`**: 페이지 구조 (시맨틱 HTML)
- **`frontend/styles.css`**: 스타일링 (반응형, 애니메이션)
- **`frontend/script.js`**: JavaScript 로직 (API 연동, DOM 조작)
- **`frontend/nginx.conf`**: Nginx 설정 (API 프록시)
- **`frontend/Dockerfile`**: Nginx 컨테이너 이미지

### 디자인 특징
- 그래디언트 배경 (보라색 계열)
- 좌측: 메모 목록 (스크롤 가능)
- 우측: 메모 편집 영역 (큰 텍스트 입력)
- 호버 효과 및 애니메이션
- 다크 모드 지원 가능 (CSS 변수로 확장 가능)

## 📚 다음 단계

- **Phase 5**: 통합 테스트 및 배포

자세한 내용은 `IMPLEMENTATION_GUIDE.md`를 참고하세요.

## 📚 문서

- **PRD.md** - 프로젝트 요구사항 및 기획
- **IMPLEMENTATION_GUIDE.md** - 5단계 구현 가이드
- **TESTING_GUIDE.md** - 통합 테스트 및 검증 절차
- **CLAUDE.md** - Claude Code 개발자 가이드

## 📝 라이선스

MIT
