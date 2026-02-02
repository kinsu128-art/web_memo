# 테스트 가이드

메모관리 웹 애플리케이션의 통합 테스트 및 검증 절차입니다.

---

## 🚀 전체 시스템 실행

### 1단계: 서비스 시작
```bash
# docker_test 디렉토리에서 실행
cd D:\VibeCoding\docker_test

# 전체 서비스 시작 (MySQL, Backend, Frontend)
docker-compose up

# 또는 백그라운드 실행
docker-compose up -d
```

### 2단계: 실행 확인
```bash
# 서비스 상태 확인
docker-compose ps

# 예상 출력:
# NAME                COMMAND                  SERVICE      STATUS
# memo_db             "docker-entrypoint.s…"  db           Up (healthy)
# memo_backend        "npm start"              backend      Up
# memo_frontend       "nginx -g daemon off"    frontend     Up
```

---

## ✅ 서비스별 헬스 체크

### MySQL 데이터베이스

**확인 방법:**
```bash
# 데이터베이스 접속 테스트
docker-compose exec db mysql -u memouser -p -e "SELECT 1"

# 비밀번호: memopass

# 예상 결과:
# +---+
# | 1 |
# +---+
# | 1 |
# +---+
```

**테이블 확인:**
```bash
# MySQL 접속
docker-compose exec db mysql -u memouser -p memos_db

# MySQL 프롬프트에서:
mysql> SHOW TABLES;
mysql> DESC memos;
mysql> SELECT COUNT(*) FROM memos;
```

**예상 결과:**
- `memos` 테이블 존재
- 5개 컬럼: id, title, content, created_at, updated_at
- 3개의 샘플 메모

### 백엔드 API

**헬스 체크:**
```bash
curl http://localhost:3000/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "timestamp": "2024-02-02T12:00:00.000Z"
}
```

**루트 엔드포인트:**
```bash
curl http://localhost:3000/
```

**예상 응답:**
```json
{
  "message": "메모관리 API 서버",
  "version": "1.0.0",
  "endpoints": {
    "memos": "/api/memos",
    "health": "/health"
  }
}
```

### 프론트엔드

**브라우저에서 접속:**
```
http://localhost
```

**확인 사항:**
- ✅ 페이지가 로드됨
- ✅ "메모관리" 헤더 표시
- ✅ 메모 목록 표시 (3개 샘플 메모)
- ✅ 폼 영역 표시

---

## 🧪 API 엔드포인트 테스트

### 1. GET /api/memos (메모 목록 조회)

**명령어:**
```bash
curl http://localhost:3000/api/memos
```

**예상 응답:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "첫 번째 메모",
      "content": "이것은 첫 번째 샘플 메모입니다.",
      "created_at": "2024-02-02T10:00:00.000Z",
      "updated_at": "2024-02-02T10:00:00.000Z"
    },
    {
      "id": 2,
      "title": "두 번째 메모",
      "content": "이것은 두 번째 샘플 메모입니다.\n여러 줄을 포함할 수 있습니다.",
      "created_at": "2024-02-02T10:00:01.000Z",
      "updated_at": "2024-02-02T10:00:01.000Z"
    },
    {
      "id": 3,
      "title": "세 번째 메모",
      "content": "메모관리 애플리케이션에 오신 것을 환영합니다!",
      "created_at": "2024-02-02T10:00:02.000Z",
      "updated_at": "2024-02-02T10:00:02.000Z"
    }
  ],
  "count": 3
}
```

### 2. POST /api/memos (메모 생성)

**명령어:**
```bash
curl -X POST http://localhost:3000/api/memos \
  -H "Content-Type: application/json" \
  -d '{"title":"새로운 메모","content":"이것은 새로운 메모입니다"}'
```

**예상 응답:**
```json
{
  "success": true,
  "message": "메모가 생성되었습니다",
  "data": {
    "id": 4,
    "title": "새로운 메모",
    "content": "이것은 새로운 메모입니다",
    "created_at": "2024-02-02T12:30:00.000Z",
    "updated_at": "2024-02-02T12:30:00.000Z"
  }
}
```

**에러 케이스:**
```bash
# 제목 누락
curl -X POST http://localhost:3000/api/memos \
  -H "Content-Type: application/json" \
  -d '{"content":"내용만 있음"}'

# 예상 응답: { "success": false, "message": "제목과 내용은 필수입니다" }
```

### 3. GET /api/memos/:id (메모 상세 조회)

**명령어:**
```bash
curl http://localhost:3000/api/memos/1
```

**예상 응답:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "첫 번째 메모",
    "content": "이것은 첫 번째 샘플 메모입니다.",
    "created_at": "2024-02-02T10:00:00.000Z",
    "updated_at": "2024-02-02T10:00:00.000Z"
  }
}
```

**에러 케이스:**
```bash
# 존재하지 않는 ID
curl http://localhost:3000/api/memos/9999

# 예상 응답: { "success": false, "message": "메모를 찾을 수 없습니다" }
```

### 4. PUT /api/memos/:id (메모 수정)

**명령어:**
```bash
curl -X PUT http://localhost:3000/api/memos/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"수정된 제목","content":"수정된 내용"}'
```

**예상 응답:**
```json
{
  "success": true,
  "message": "메모가 수정되었습니다",
  "data": {
    "id": 1,
    "title": "수정된 제목",
    "content": "수정된 내용",
    "created_at": "2024-02-02T10:00:00.000Z",
    "updated_at": "2024-02-02T12:35:00.000Z"
  }
}
```

### 5. DELETE /api/memos/:id (메모 삭제)

**명령어:**
```bash
curl -X DELETE http://localhost:3000/api/memos/1
```

**예상 응답:**
```json
{
  "success": true,
  "message": "메모가 삭제되었습니다"
}
```

**확인:**
```bash
# 삭제 후 조회
curl http://localhost:3000/api/memos/1

# 예상 응답: { "success": false, "message": "메모를 찾을 수 없습니다" }
```

---

## 🌐 브라우저 UI 테스트

### 초기 상태
**URL:** `http://localhost`

**확인 사항:**
- [ ] 헤더 "📝 메모관리" 표시
- [ ] 좌측: 메모 목록 (3개 샘플)
- [ ] 우측: "새 메모 작성" 폼
- [ ] 제목/내용 입력 필드 보임
- [ ] "저장" 버튼 활성화

### 메모 목록 상호작용
**작업:**
1. 메모 항목 클릭
2. 호버 시 수정(✏️)/삭제(🗑️) 버튼 표시

**확인 사항:**
- [ ] 메모 선택 시 우측 폼에 데이터 로드
- [ ] 선택된 메모 하이라이트 (배경색 변경)
- [ ] 버튼이 우측 폼에서만 표시 (목록에서는 숨김)

### 메모 생성
**작업:**
1. 제목 입력 (예: "테스트 메모")
2. 내용 입력 (예: "이것은 테스트입니다")
3. "저장" 버튼 클릭

**확인 사항:**
- [ ] 초록색 성공 메시지 표시
- [ ] 새 메모가 목록에 추가됨
- [ ] 폼 초기화 (제목/내용 삭제)
- [ ] "새 메모 작성" 텍스트로 변경

### 메모 수정
**작업:**
1. 기존 메모 클릭
2. 제목 수정 (예: "수정된 메모")
3. 내용 수정
4. "수정" 버튼 클릭

**확인 사항:**
- [ ] 폼 제목이 "메모 편집: [메모 제목]"으로 변경
- [ ] "취소" 버튼 표시
- [ ] "저장" → "수정"으로 변경
- [ ] 수정 후 목록에 반영

### 메모 삭제
**작업:**
1. 메모 항목의 삭제(🗑️) 버튼 클릭
2. 확인 다이얼로그에서 "삭제" 클릭

**확인 사항:**
- [ ] 확인 다이얼로그 표시
- [ ] "메모 제목을 삭제하시겠습니까?" 메시지
- [ ] 삭제 후 목록에서 제거
- [ ] 빨강색 성공 메시지 표시

### 특수 기능
**작업:**

1. **새로고침 버튼** (🔄) 클릭
   - [ ] 서버에서 최신 메모 다시 로드

2. **초기화 버튼** (✕) 클릭 (편집 모드)
   - [ ] 작성 중인 내용 삭제 확인
   - [ ] 폼 초기화

3. **Ctrl+Enter** 키
   - [ ] 메모 저장/수정

4. **Escape** 키 (편집 모드)
   - [ ] 편집 취소

### 반응형 디자인

**데스크톱 (1200px+):**
- [ ] 2단 레이아웃 (좌측 목록, 우측 편집)
- [ ] 편집 버튼 호버시만 표시

**태블릿 (768px):**
- [ ] 1단 레이아웃으로 변경
- [ ] 메모 목록 상단
- [ ] 편집 폼 하단
- [ ] 버튼이 항상 보임

**모바일 (480px):**
- [ ] 텍스트 크기 조정
- [ ] 버튼 너비 100%
- [ ] 모든 요소 터치 친화적

---

## 🔍 브라우저 개발자 도구

### Network 탭
**작업:** 메모 생성

**확인 사항:**
- [ ] POST /api/memos 요청 발생
- [ ] 상태 코드 201 (Created)
- [ ] Request Headers: Content-Type: application/json
- [ ] Response: `{ success: true, data: {...} }`

### Console 탭
**확인 사항:**
- [ ] 에러 없음
- [ ] 경고(Warning) 최소화
- [ ] API 호출 로그 확인 가능

### Elements/Inspector 탭
**확인 사항:**
- [ ] 시맨틱 HTML 사용
- [ ] 접근성 속성 (aria-label 등)
- [ ] CSS 클래스 명확함

---

## 📊 성능 테스트

### 응답 시간
```bash
# 메모 목록 조회 시간 측정
time curl http://localhost:3000/api/memos

# 예상: 100ms 이하
```

### 데이터베이스 쿼리
```bash
# MySQL 접속
docker-compose exec db mysql -u memouser -p memos_db

# 쿼리 실행 시간 확인
mysql> SELECT * FROM memos;

# MySQL Slow Query Log 확인 (선택사항)
```

### 메모리 사용량
```bash
# Docker 통계
docker stats

# 백엔드 메모리 사용량 확인 (50MB 이하 예상)
```

---

## 🐛 디버깅

### 로그 확인

**백엔드 로그:**
```bash
docker-compose logs -f backend
```

**데이터베이스 로그:**
```bash
docker-compose logs -f db
```

**전체 로그:**
```bash
docker-compose logs -f
```

### 일반적인 문제

#### 1. "Cannot GET /api/memos"
```bash
# 원인: 백엔드 미실행
docker-compose logs backend

# 해결: 에러 메시지 확인 후 수정
docker-compose restart backend
```

#### 2. "Connection refused"
```bash
# 원인: MySQL 미실행 또는 초기화 중
docker-compose logs db

# 해결: 20초 대기 후 재시도
```

#### 3. UI가 안 나타남
```bash
# 원인: 프론트엔드 미실행 또는 파일 로드 실패
docker-compose logs frontend

# 해결: 캐시 비우기 (Ctrl+Shift+Delete)
```

#### 4. "504 Bad Gateway"
```bash
# 원인: Nginx → 백엔드 연결 실패
docker-compose logs frontend

# 해결: nginx.conf 확인
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf
```

---

## 📋 최종 체크리스트

### 시스템 시작
- [ ] `docker-compose up` 실행
- [ ] 모든 서비스 "Up" 상태
- [ ] MySQL 헬스체크 "healthy"

### 백엔드 API
- [ ] GET /api/memos ✓
- [ ] GET /api/memos/1 ✓
- [ ] POST /api/memos ✓
- [ ] PUT /api/memos/1 ✓
- [ ] DELETE /api/memos/1 ✓
- [ ] GET /health ✓

### 프론트엔드 UI
- [ ] 페이지 로드 (http://localhost)
- [ ] 메모 목록 표시
- [ ] 메모 생성
- [ ] 메모 수정
- [ ] 메모 삭제
- [ ] 메시지 표시
- [ ] 반응형 디자인

### 데이터베이스
- [ ] 테이블 존재 (memos)
- [ ] 샘플 데이터 3개
- [ ] 새 메모 저장됨
- [ ] 수정된 메모 업데이트됨
- [ ] 삭제된 메모 제거됨

### 오류 처리
- [ ] 서버 다운 시 에러 메시지
- [ ] 빈 입력 필드 검증
- [ ] 없는 ID 조회 시 404
- [ ] 네트워크 오류 처리

### 문서화
- [ ] README.md 완성
- [ ] CLAUDE.md 완성
- [ ] TESTING_GUIDE.md 완성
- [ ] PRD.md 완성
- [ ] IMPLEMENTATION_GUIDE.md 완성

---

## 🎉 배포 확인

```bash
# 모든 서비스 상태 확인
docker-compose ps

# 모든 테스트 통과 시
echo "✅ 배포 준비 완료"

# 프로덕션 환경
docker-compose up -d

# 로그 모니터링
docker-compose logs -f
```

---

마지막 업데이트: 2024-02-02
