# 메모관리 프로그램 구현 가이드 (5단계)

Claude Code에서 PRD를 기반으로 구현하기 위한 단계별 가이드입니다.

---

## Phase 1: 프로젝트 구조 및 Docker 환경 설정

**목표:** 프로젝트의 기본 구조를 설정하고 Docker 환경을 구성합니다.

### 1.1 디렉토리 구조 생성

```
docker_test/
├── backend/                 # 백엔드 애플리케이션
│   ├── src/
│   │   ├── app.js (또는 main.py, etc.)
│   │   ├── config.js
│   │   ├── routes/
│   │   │   └── memos.js
│   │   ├── controllers/
│   │   │   └── memoController.js
│   │   ├── models/
│   │   │   └── Memo.js
│   │   └── db.js
│   ├── package.json
│   ├── Dockerfile
│   └── .dockerignore
├── frontend/                # 프론트엔드 (HTML/CSS/JS)
│   ├── index.html
│   ├── styles.css
│   ├── script.js
│   └── Dockerfile
├── database/                # MySQL 관련 파일
│   └── init.sql
├── docker-compose.yml       # Docker Compose 설정
├── PRD.md                   # 프로젝트 요구사항 문서
└── IMPLEMENTATION_GUIDE.md  # 이 파일
```

### 1.2 주요 파일 생성 명령어

**작업 항목:**
1. 각 디렉토리 생성
2. `docker-compose.yml` 작성
   - MySQL 서비스 (포트 3306)
   - 백엔드 서비스 (포트 3000)
   - 프론트엔드 서비스 (포트 80, Nginx)
3. 각 Dockerfile 작성 (백엔드, 프론트엔드)
4. `.dockerignore` 파일 작성
5. `.env.example` 파일 생성 (환경 변수 템플릿)

**산출물:**
- ✅ `docker-compose.yml` - Docker Compose 설정 파일
- ✅ `backend/Dockerfile` - 백엔드 이미지 정의
- ✅ `frontend/Dockerfile` - 프론트엔드 이미지 정의
- ✅ 프로젝트 디렉토리 구조 완성

**확인 방법:**
```bash
docker-compose config  # Docker Compose 설정 유효성 확인
```

---

## Phase 2: MySQL 데이터베이스 설계 및 초기화

**목표:** MySQL 데이터베이스 스키마를 설계하고 초기화 스크립트를 작성합니다.

### 2.1 작업 항목

1. **`database/init.sql` 작성**
   - 데이터베이스 생성 (`memos_db`)
   - `memos` 테이블 생성
   - 테이블 컬럼: id, title, content, created_at, updated_at
   - 인덱스 설정 (검색 성능 최적화)

2. **Docker Compose에서 MySQL 초기화 설정**
   - `volumes` 에서 `init.sql` 마운트
   - 환경 변수 설정 (root 비밀번호, DB 이름)

3. **연결 정보 정의**
   - Host: `db` (Docker 네트워크)
   - Port: `3306`
   - Database: `memos_db`
   - User: `root` (또는 별도 사용자)

### 2.2 산출물

- ✅ `database/init.sql` - 데이터베이스 초기화 스크립트
- ✅ `docker-compose.yml` 업데이트 - MySQL 볼륨/환경변수 설정
- ✅ `.env.example` 업데이트 - DB 연결 정보

**테스트 방법:**
```bash
docker-compose up db  # MySQL 컨테이너만 실행
docker exec docker_test-db-1 mysql -u root -p -e "USE memos_db; SHOW TABLES;"
```

---

## Phase 3: 백엔드 API 개발

**목표:** REST API 서버를 구현하고 MySQL과 연동합니다.

### 3.1 작업 항목

1. **프로젝트 초기화**
   - `backend/package.json` 작성 (Node.js 기준)
   - 필수 라이브러리 설정
     - `express` - 웹 프레임워크
     - `mysql2` - MySQL 드라이버
     - `dotenv` - 환경 변수 관리
     - `cors` - CORS 처리

2. **데이터베이스 연결**
   - `backend/src/db.js` - MySQL 연결 풀 설정
   - 환경 변수에서 DB 설정 읽기

3. **모델 계층 구현**
   - `backend/src/models/Memo.js`
   - 메서드: `create()`, `findAll()`, `findById()`, `update()`, `delete()`

4. **컨트롤러 계층 구현**
   - `backend/src/controllers/memoController.js`
   - 요청/응답 처리 로직

5. **라우트 정의**
   - `backend/src/routes/memos.js`
   - `GET /api/memos` - 메모 목록
   - `GET /api/memos/:id` - 메모 상세
   - `POST /api/memos` - 메모 생성
   - `PUT /api/memos/:id` - 메모 수정
   - `DELETE /api/memos/:id` - 메모 삭제

6. **메인 애플리케이션**
   - `backend/src/app.js` - Express 서버 설정
   - CORS 설정
   - 라우트 마운트
   - 에러 핸들링 미들웨어

7. **Dockerfile 작성**
   - Node.js 베이스 이미지
   - 의존성 설치
   - 애플리케이션 실행

### 3.2 산출물

- ✅ `backend/package.json` - 프로젝트 의존성
- ✅ `backend/src/db.js` - 데이터베이스 연결
- ✅ `backend/src/models/Memo.js` - 데이터 모델
- ✅ `backend/src/controllers/memoController.js` - 비즈니스 로직
- ✅ `backend/src/routes/memos.js` - API 라우트
- ✅ `backend/src/app.js` - 메인 애플리케이션
- ✅ `backend/Dockerfile` - 컨테이너 이미지

**테스트 방법:**
```bash
docker-compose up  # 모든 서비스 실행

# 다른 터미널에서 API 테스트
curl http://localhost:3000/api/memos

# 메모 생성
curl -X POST http://localhost:3000/api/memos \
  -H "Content-Type: application/json" \
  -d '{"title":"테스트","content":"내용"}'
```

---

## Phase 4: 프론트엔드 UI 개발

**목표:** 웹 인터페이스를 구현하고 백엔드 API와 연동합니다.

### 4.1 작업 항목

1. **HTML 구조**
   - `frontend/index.html` 작성
   - 메모 목록 표시 영역
   - 메모 생성 폼
   - 메모 상세 보기 모달/페이지

2. **스타일링**
   - `frontend/styles.css` 작성
   - 반응형 디자인 (모바일/데스크톱)
   - 간단하고 직관적인 UI

3. **JavaScript 로직**
   - `frontend/script.js` 작성
   - API 호출 함수 (`fetch` 사용)
   - 메모 목록 렌더링
   - CRUD 이벤트 핸들러
   - DOM 조작

4. **기능 구현**
   - 메모 목록 표시
   - 메모 생성 폼
   - 메모 상세 조회
   - 메모 수정 (인라인 편집 또는 별도 폼)
   - 메모 삭제 (확인 다이얼로그)

5. **Dockerfile 작성**
   - Nginx를 사용한 정적 파일 서빙
   - 리버스 프록시 설정 (백엔드 포워딩)

### 4.2 산출물

- ✅ `frontend/index.html` - 웹 페이지
- ✅ `frontend/styles.css` - 스타일
- ✅ `frontend/script.js` - 클라이언트 로직
- ✅ `frontend/Dockerfile` - Nginx 설정
- ✅ `frontend/nginx.conf` (선택) - Nginx 리버스 프록시

**테스트 방법:**
```bash
docker-compose up  # 모든 서비스 실행

# 브라우저에서 접속
http://localhost  # 프론트엔드
http://localhost:3000/api/memos  # 백엔드 API
```

---

## Phase 5: 통합 테스트 및 배포 준비

**목표:** 전체 시스템을 통합하여 테스트하고 배포 가능한 상태로 만듭니다.

### 5.1 작업 항목

1. **통합 테스트**
   - 모든 서비스가 함께 실행되는지 확인
   - API 엔드포인트 테스트
   - 데이터 베이스 데이터 영속성 확인
   - CORS 설정 확인

2. **문서화**
   - `README.md` 작성
     - 프로젝트 설명
     - 설치 방법
     - 실행 방법
     - API 문서
   - `CLAUDE.md` 작성 (Claude Code 가이드)

3. **환경 변수 설정**
   - `.env.example` 최종 확인
   - `.env` 파일 생성 (git에 커밋하지 않음)

4. **오류 처리 및 로깅**
   - 백엔드 에러 핸들링 확인
   - 데이터베이스 연결 오류 처리
   - 클라이언트 측 에러 메시지 표시

5. **배포 준비**
   - Docker 이미지 빌드 테스트
   - Docker Hub/Private Registry 푸시 준비
   - 프로덕션 환경 설정 (선택사항)

6. **성능 최적화 (선택)**
   - 프론트엔드 번들 최적화
   - 데이터베이스 쿼리 최적화
   - 캐싱 전략 검토

### 5.2 산출물

- ✅ `README.md` - 프로젝트 문서
- ✅ `CLAUDE.md` - Claude Code 가이드
- ✅ `.env.example` - 환경 변수 템플릿
- ✅ 모든 서비스의 Docker 이미지 빌드 완료
- ✅ 통합 테스트 완료

**최종 테스트 방법:**
```bash
# 전체 시스템 실행
docker-compose up

# 헬스 체크
curl http://localhost/  # 프론트엔드
curl http://localhost:3000/api/memos  # 백엔드

# 데이터베이스 상태 확인
docker-compose exec db mysql -u root -p -e "USE memos_db; SELECT * FROM memos;"

# 로그 확인
docker-compose logs -f

# 정리
docker-compose down
docker-compose down -v  # 볼륨도 삭제
```

---

## 📋 체크리스트

### Phase 1
- [ ] 디렉토리 구조 생성
- [ ] `docker-compose.yml` 작성
- [ ] 각 Dockerfile 작성
- [ ] `.env.example` 생성

### Phase 2
- [ ] `database/init.sql` 작성
- [ ] MySQL 연결 설정 확인
- [ ] 테이블 생성 확인

### Phase 3
- [ ] `backend/package.json` 작성
- [ ] 데이터베이스 연결 구현
- [ ] CRUD API 전부 구현
- [ ] API 테스트 완료

### Phase 4
- [ ] HTML/CSS/JS 작성
- [ ] API 연동 확인
- [ ] UI/UX 개선
- [ ] 반응형 디자인 확인

### Phase 5
- [ ] 통합 테스트 완료
- [ ] 문서화 작성
- [ ] 배포 준비 완료
- [ ] 최종 확인

---

## 🚀 실행 명령어 요약

```bash
# 프로젝트 시작
docker-compose up

# 특정 서비스만 실행
docker-compose up db              # MySQL만
docker-compose up backend         # 백엔드만
docker-compose up frontend        # 프론트엔드만

# 백그라운드 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
docker-compose logs -f backend    # 특정 서비스

# 종료
docker-compose down               # 컨테이너 종료
docker-compose down -v            # 컨테이너 + 볼륨 삭제

# 재빌드
docker-compose up --build
```

---

## 💡 주의사항

1. **환경 변수**: `.env` 파일은 git에 커밋하지 마세요.
2. **데이터 베이스**: 초기화 스크립트 경로가 올바른지 확인하세요.
3. **포트 충돌**: 3000, 3306, 80번 포트가 사용 중이 아닌지 확인하세요.
4. **Docker 네트워크**: 서비스 간 통신은 서비스명으로 호출합니다 (`db`, `backend`, etc).
5. **CORS**: 프론트엔드와 백엔드 도메인을 정확히 설정하세요.
