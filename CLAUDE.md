# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🎯 프로젝트 개요

**메모관리 웹 애플리케이션**

Docker 환경에서 실행되는 간단한 메모관리 서비스입니다.
- **언어**: Node.js (Express) + HTML/CSS/JavaScript
- **데이터베이스**: MySQL 8.0
- **배포**: Docker Compose

---

## 📋 빠른 시작 명령어

### 개발 환경 실행
```bash
# 전체 서비스 실행 (MySQL, Backend, Frontend)
docker-compose up

# 백그라운드 실행
docker-compose up -d

# 특정 서비스만 실행
docker-compose up db        # MySQL만
docker-compose up backend   # 백엔드만
docker-compose up frontend  # 프론트엔드만

# 재빌드하여 실행
docker-compose up --build
```

### 로그 확인
```bash
# 모든 서비스 로그
docker-compose logs -f

# 특정 서비스 로그 (실시간)
docker-compose logs -f backend
docker-compose logs -f db
docker-compose logs -f frontend
```

### 서비스 종료
```bash
# 컨테이너 종료
docker-compose down

# 컨테이너 + 볼륨 삭제 (DB 데이터 삭제됨)
docker-compose down -v
```

### 데이터베이스 접속
```bash
# MySQL 접속 (memouser 계정)
docker-compose exec db mysql -u memouser -p memos_db

# MySQL 접속 (root 계정)
docker-compose exec db mysql -u root -p

# 테이블 확인
mysql> SHOW TABLES;
mysql> DESC memos;
mysql> SELECT * FROM memos;
```

---

## 🏗️ 프로젝트 구조 및 아키텍처

### 디렉토리 구조
```
docker_test/
├── backend/                 # Node.js Express API 서버
│   ├── src/
│   │   ├── app.js          # Express 애플리케이션 설정
│   │   ├── db.js           # MySQL 연결 풀 관리
│   │   ├── routes/
│   │   │   └── memos.js    # API 라우트 정의 (5개 엔드포인트)
│   │   ├── controllers/
│   │   │   └── memoController.js  # 요청 처리 로직
│   │   └── models/
│   │       └── Memo.js     # 데이터 모델 및 DB 쿼리
│   ├── package.json        # Node.js 의존성
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/                # Nginx + 정적 웹 페이지
│   ├── index.html          # 페이지 구조
│   ├── styles.css          # 반응형 스타일
│   ├── script.js           # 클라이언트 로직 (API 연동)
│   ├── nginx.conf          # Nginx 리버스 프록시
│   └── Dockerfile
├── database/                # MySQL 초기화
│   └── init.sql            # 테이블 생성 스크립트
├── docker-compose.yml       # 3개 서비스 구성
├── .env                     # 환경 변수 (개발)
├── .env.example             # 환경 변수 템플릿
├── .gitignore
├── README.md
├── PRD.md                   # 프로젝트 요구사항
├── IMPLEMENTATION_GUIDE.md  # 5단계 구현 가이드
└── CLAUDE.md               # 이 파일
```

### 시스템 아키텍처
```
┌─────────────────────────────────────┐
│      사용자 브라우저                 │
│    http://localhost               │
└────────────┬────────────────────────┘
             │
   ┌─────────▼──────────┐
   │  Nginx (Port 80)   │
   │  리버스 프록시      │
   │  - / → frontend    │
   │  - /api/ → backend │
   └─────────┬──────────┘
             │
   ┌─────────▼──────────────────┐
   │  Express (Port 3000)       │
   │  - /api/memos GET/POST/... │
   │  - /health                 │
   └─────────┬──────────────────┘
             │
   ┌─────────▼──────────┐
   │  MySQL (Port 3306) │
   │  memos_db          │
   │  - memos 테이블    │
   └────────────────────┘
```

### 요청 흐름
```
사용자 입력
  ↓
script.js (fetch API 호출)
  ↓
Nginx (요청 라우팅)
  ↓
routes/memos.js (라우트 매칭)
  ↓
memoController.js (요청 처리)
  ↓
models/Memo.js (DB 쿼리)
  ↓
db.js (MySQL 연결)
  ↓
MySQL 데이터베이스
  ↓
응답 반환 (JSON)
  ↓
script.js (DOM 업데이트)
  ↓
사용자에게 표시
```

---

## 🔌 API 엔드포인트

### 1. 메모 목록 조회
```
GET /api/memos
```
- 모든 메모 조회 (최신순)
- 응답: `{ success: true, data: [...], count: N }`

### 2. 메모 상세 조회
```
GET /api/memos/:id
```
- ID로 특정 메모 조회
- 응답: `{ success: true, data: { id, title, content, created_at, updated_at } }`

### 3. 메모 생성
```
POST /api/memos
Content-Type: application/json

{
  "title": "제목",
  "content": "내용"
}
```
- 새 메모 생성
- 응답: `{ success: true, message: "...", data: { id, ... } }`

### 4. 메모 수정
```
PUT /api/memos/:id
Content-Type: application/json

{
  "title": "수정된 제목",
  "content": "수정된 내용"
}
```
- 기존 메모 수정
- 응답: `{ success: true, message: "...", data: { id, ... } }`

### 5. 메모 삭제
```
DELETE /api/memos/:id
```
- 메모 삭제
- 응답: `{ success: true, message: "메모가 삭제되었습니다" }`

### 6. 헬스 체크
```
GET /health
```
- 서버 상태 확인
- 응답: `{ status: "ok", timestamp: "..." }`

---

## 🗄️ 데이터베이스 스키마

### memos 테이블
```sql
CREATE TABLE memos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 초기 데이터
- 3개의 샘플 메모가 자동으로 생성됨
- `database/init.sql` 참고

---

## 🛠️ 개발 가이드

### 백엔드 개발

#### 파일 구조
- **app.js**: 서버 설정, 미들웨어, 라우트 마운트
- **db.js**: MySQL 연결 풀 (connection pooling)
- **routes/memos.js**: 5개 REST API 엔드포인트 정의
- **controllers/memoController.js**: 요청 처리 로직 (입력 검증, 에러 처리)
- **models/Memo.js**: DB 쿼리 함수 (CRUD)

#### 중요 라이브러리
- `express`: 웹 프레임워크
- `mysql2`: MySQL 드라이버 (Promise 기반)
- `cors`: CORS 처리
- `body-parser`: JSON 파싱
- `dotenv`: 환경 변수 관리

#### 일반적인 작업

**API 응답 형식 추가**
```javascript
// controllers/memoController.js 참고
{
  success: true/false,
  message: "...",
  data: {...}
}
```

**에러 처리**
- 모든 함수에서 try-catch 사용
- 적절한 HTTP 상태 코드 반환
- 콘솔 로깅으로 디버깅

**데이터 검증**
- 필수 필드 확인
- 공백 trim 처리
- 길이 제한 확인

### 프론트엔드 개발

#### 파일 구조
- **index.html**: 페이지 마크업 (시맨틱 HTML)
- **styles.css**: 반응형 스타일
- **script.js**: 클라이언트 로직

#### 주요 함수
```javascript
// API 호출
loadMemos()          // 메모 목록 로드
createMemo()         // 메모 생성
updateMemo()         // 메모 수정
deleteMemo()         // 메모 삭제

// UI 렌더링
renderMemoList()     // 메모 목록 표시
selectMemo()         // 메모 선택 및 로드
resetForm()          // 폼 초기화

// 이벤트 처리
handleFormSubmit()   // 폼 제출
handleCancel()       // 취소
handleConfirmDelete() // 삭제 확인

// 유틸리티
formatDate()         // 날짜 포맷팅
showMessage()        // 메시지 표시
```

#### 일반적인 작업

**API 호출 추가**
```javascript
// script.js에 함수 추가
async function newFeature() {
    try {
        const response = await fetch('/api/memos', {
            method: 'GET',
        });
        const result = await response.json();
        // 처리...
    } catch (error) {
        console.error('❌ 실패:', error);
        showMessage('오류 메시지', 'error');
    }
}
```

**스타일 추가/수정**
- `styles.css` 수정
- CSS 변수 활용 가능
- 반응형 쿼리 유지

**UI 요소 추가**
- `index.html`에서 마크업 추가
- `script.js`에서 이벤트 리스너 등록
- `styles.css`에서 스타일 정의

---

## 🧪 테스트 방법

### API 테스트 (curl)
```bash
# 메모 목록 조회
curl http://localhost:3000/api/memos

# 메모 생성
curl -X POST http://localhost:3000/api/memos \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트","content":"내용"}'

# 메모 수정 (ID 1)
curl -X PUT http://localhost:3000/api/memos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"수정됨","content":"수정된 내용"}'

# 메모 삭제 (ID 1)
curl -X DELETE http://localhost:3000/api/memos/1

# 헬스 체크
curl http://localhost:3000/health
```

### 브라우저 테스트
1. `http://localhost` 접속
2. 메모 목록 확인
3. 새 메모 생성 (제목 + 내용)
4. 메모 클릭하여 편집
5. 메모 삭제 (확인 다이얼로그)
6. 새로고침 (🔄) 버튼 테스트

### 데이터베이스 테스트
```bash
# MySQL 접속
docker-compose exec db mysql -u memouser -p memos_db

# 테이블 확인
mysql> SELECT * FROM memos;
mysql> SELECT COUNT(*) FROM memos;
mysql> SELECT * FROM memos WHERE id = 1;
```

### 브라우저 개발자 도구
- F12 또는 우클릭 → 검사
- **Network 탭**: API 요청/응답 확인
- **Console 탭**: JavaScript 에러 확인
- **Application 탭**: 로컬 스토리지 (필요시)

---

## ⚙️ 환경 변수

### .env 파일
```bash
# 데이터베이스
DB_HOST=db
DB_PORT=3306
DB_NAME=memos_db
DB_USER=memouser
DB_PASSWORD=memopass
DB_ROOT_PASSWORD=root

# 백엔드
NODE_ENV=development
PORT=3000

# 프론트엔드
FRONTEND_URL=http://localhost
BACKEND_API_URL=http://localhost/api
```

### 변수 변경 시 주의사항
- `DB_HOST`: Docker 네트워크 내에서는 반드시 `db`
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`: MySQL init.sql과 일치
- `PORT`: Dockerfile의 EXPOSE와 일치
- `NODE_ENV`: `development` 또는 `production`

---

## 📝 로깅 및 디버깅

### 콘솔 로그
```javascript
// 백엔드 (app.js, db.js)
console.log('✅ 성공 메시지');
console.error('❌ 에러 메시지');

// 프론트엔드 (script.js)
console.log('📨 요청:', data);
console.error('❌ 에러:', error);
```

### Docker 로그
```bash
# 백엔드 로그
docker-compose logs -f backend

# 데이터베이스 로그
docker-compose logs -f db

# 프론트엔드 로그 (Nginx)
docker-compose logs -f frontend

# 전체 로그
docker-compose logs -f
```

### 일반적인 문제 해결

**"Connection refused" 에러**
- MySQL이 시작되지 않음
- `docker-compose up db` 확인
- DB 헬스체크 대기 (최대 20초)

**"Cannot GET /api/memos" 에러**
- 백엔드가 시작되지 않음
- `docker-compose logs -f backend` 확인
- `src/app.js`에서 라우트 마운트 확인

**"504 Bad Gateway" 에러**
- Nginx가 백엔드에 연결할 수 없음
- `frontend/nginx.conf`에서 `proxy_pass` 확인
- 백엔드가 실행 중인지 확인

**UI가 안 나타남**
- 프론트엔드 서비스 확인
- `frontend/index.html` 확인
- 브라우저 캐시 비우기 (Ctrl+Shift+Delete)

---

## 📂 주요 파일 설명

### backend/src/app.js
- Express 애플리케이션 초기화
- CORS, Body Parser 미들웨어 설정
- 요청 로깅 미들웨어
- 라우트 마운트
- 에러 핸들러
- 서버 시작

### backend/src/db.js
- MySQL 연결 풀 생성
- 환경 변수에서 설정 읽기
- 연결 테스트 및 로깅

### backend/src/models/Memo.js
- Memo 클래스 (정적 메서드)
- DB 쿼리 함수
- `findAll()`, `findById()`, `create()`, `update()`, `delete()`

### backend/src/controllers/memoController.js
- 5개 핸들러 함수
- 입력 검증
- 에러 처리
- JSON 응답 형식

### backend/src/routes/memos.js
- 5개 라우트 정의
- 메서드별 라우팅 (GET, POST, PUT, DELETE)

### frontend/index.html
- 시맨틱 HTML 구조
- 메모 목록 섹션
- 메모 편집 섹션
- 템플릿 요소
- 확인 다이얼로그

### frontend/styles.css
- 반응형 그리드 레이아웃
- 색상 스킴 및 테마
- 애니메이션
- 모바일 최적화

### frontend/script.js
- DOM 요소 선택
- API 호출 함수
- 이벤트 리스너
- UI 렌더링
- 상태 관리

---

## 🚀 배포 가이드

### 프로덕션 환경 준비
1. `.env` 파일 생성 (프로덕션 값)
2. `NODE_ENV=production` 설정
3. 강력한 DB 비밀번호 설정
4. CORS 출처 제한 (필요시)
5. 로깅 레벨 조정

### Docker 이미지 빌드
```bash
# 이미지 빌드 (태그: memo-app:1.0)
docker-compose build

# Docker Hub 푸시 (선택사항)
docker tag memo-app:1.0 username/memo-app:1.0
docker push username/memo-app:1.0
```

### 프로덕션 배포
```bash
# 백그라운드 실행
docker-compose up -d

# 상태 확인
docker-compose ps

# 로그 확인
docker-compose logs -f
```

---

## 📚 추가 리소스

- **PRD.md**: 프로젝트 요구사항 문서
- **IMPLEMENTATION_GUIDE.md**: 5단계 구현 가이드
- **README.md**: 프로젝트 설명서 및 빠른 시작

---

## ✅ 기억할 사항

1. **Docker 네트워크**: 서비스 간 통신은 서비스명으로 호출 (`db`, `backend`)
2. **포트 충돌**: 80, 3000, 3306 포트가 사용 중이 아닌지 확인
3. **환경 변수**: `.env` 파일은 git에 커밋하지 마세요
4. **CORS 설정**: 개발 중에는 `*`, 프로덕션에서는 구체적 출처 설정
5. **API 응답**: 항상 `{ success, data/message, error? }` 형식
6. **에러 처리**: try-catch로 모든 비동기 작업 감싸기
7. **입력 검증**: 백엔드와 프론트엔드 모두에서 검증
8. **데이터 타입**: MySQL은 UTF8MB4 (한글 지원)
9. **로깅**: 개발/프로덕션 환경별 로그 레벨 다르게 설정
10. **테스트**: 수정 후 항상 curl 또는 브라우저로 테스트

---

## 🔑 핵심 개념

### MVC 패턴
- **Model** (models/Memo.js): 데이터 및 비즈니스 로직
- **View** (frontend/index.html): UI 표현
- **Controller** (controllers/memoController.js): 요청 처리

### REST API
- **GET**: 데이터 조회 (멱등성)
- **POST**: 새 데이터 생성
- **PUT**: 기존 데이터 수정
- **DELETE**: 데이터 삭제

### 마이크로서비스 아키텍처
- 백엔드, 프론트엔드, 데이터베이스가 독립적으로 실행
- Docker로 각각 컨테이너화
- Docker Compose로 오케스트레이션

---

마지막 업데이트: 2024-02-02
