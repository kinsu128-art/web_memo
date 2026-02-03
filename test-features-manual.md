# 메모 앱 편집 기능 검증 가이드

## 현재 수정 사항

### 1. **목록 기능 개선**
- ✅ 텍스트 선택 없이도 목록 생성 가능
- ✅ 불릿 목록 (`<ul>`)과 번호 목록 (`<ol>`) 지원
- ✅ 위치: `script.js` applyFormat() 함수 개선

### 2. **인용구 스타일 개선**
- ✅ Inline styles 제거 → CSS 클래스 기반으로 변경
- ✅ 저장/로드 시에도 스타일 유지
- ✅ 어두운 모드 지원

### 3. **코드블록 스타일 개선**
- ✅ Inline styles 제거 → CSS 클래스 기반으로 변경
- ✅ 스크롤 가능한 코드 표시
- ✅ 어두운 모드 지원

---

## 📋 수동 테스트 체크리스트

### 테스트 전 준비
```bash
# 1. 앱 시작
docker-compose up -d

# 2. 앱 접속
http://localhost

# 3. 로그인
Email: test@dklok.com
Password: test123
```

---

### TEST 1: 목록 기능 (Bullet List)

**절차:**
1. 우측 상단 "+" 버튼으로 새 메모 생성
2. 제목 입력: "목록 테스트"
3. 본문 클릭 후 아무것도 선택하지 않은 상태에서 "목록" 버튼 클릭
4. 자동으로 `<li>항목</li>`이 생성되어야 함

**예상 결과:**
```
□ 텍스트 선택 없이도 목록 생성됨
□ 불릿 포인트가 표시됨
□ 저장됨 표시 확인
□ 다른 메모 갔다오기 → 목록 스타일 유지
```

**실제 확인:**
```html
<!-- 올바른 결과 -->
<ul>
  <li>항목</li>
</ul>
```

---

### TEST 2: 번호 목록 (Ordered List)

**절차:**
1. 목록 테스트 메모에서 엔터로 새 줄 생성
2. 텍스트 "번호 목록" 입력
3. 선택하지 않고 "번호 목록" 버튼 클릭
4. 자동 번호 매김이 나타나야 함

**예상 결과:**
```
□ 번호 매김 생성됨 (1., 2., 3., ...)
□ 저장됨 표시 확인
□ 다른 메모 갔다오기 → 스타일 유지
```

**실제 확인:**
```html
<!-- 올바른 결과 -->
<ol>
  <li>번호 목록</li>
</ol>
```

---

### TEST 3: 인용구 (Blockquote)

**절차:**
1. 메모에 텍스트 입력: "This is important"
2. 입력한 텍스트 선택
3. "인용구" 버튼 클릭
4. 왼쪽 파란 선이 있는 인용구 스타일 적용됨

**예상 결과:**
```
□ 선택한 텍스트가 인용구로 변환됨
□ 왼쪽에 파란 border가 표시됨
□ 텍스트가 이탤릭체로 보임
□ 저장됨 표시 확인
□ 다른 메모 갔다오기 → 인용구 스타일 유지
```

**실제 확인:**
```html
<!-- 올바른 결과 (inline style 없음) -->
<blockquote>This is important</blockquote>

<!-- CSS에서 스타일 처리 -->
#memoContent blockquote {
    border-left: 4px solid #2060df;
    padding-left: 15px;
    margin: 10px 0;
    color: #666;
    font-style: italic;
}
```

---

### TEST 4: 코드블록 (Code Block)

**절차:**
1. 메모에 코드 입력: `const x = 42;`
2. 입력한 코드 선택
3. "코드 블록" 버튼 클릭
4. 회색 배경의 코드 블록이 나타남

**예상 결과:**
```
□ 선택한 코드가 코드 블록으로 변환됨
□ 회색 배경이 표시됨
□ Monospace 폰트 사용됨
□ 저장됨 표시 확인
□ 다른 메모 갔다오기 → 코드블록 스타일 유지
```

**실제 확인:**
```html
<!-- 올바른 결과 (inline style 없음) -->
<pre>const x = 42;</pre>

<!-- CSS에서 스타일 처리 -->
#memoContent pre {
    background: #f4f4f4;
    padding: 10px;
    border-radius: 5px;
    font-family: monospace;
    overflow-x: auto;
    margin: 10px 0;
}
```

---

### TEST 5: 모든 기능 조합 테스트

**절차:**
1. 새 메모 생성
2. 제목 입력: "종합 테스트"
3. 아래와 같이 입력:
```
이것은 평범한 텍스트입니다.

할 일:
- 항목 1
- 항목 2
- 항목 3

우선순위:
1. 첫 번째
2. 두 번째
3. 세 번째

> 중요한 인용구
> 여러 줄도 가능합니다

예제 코드:
function hello() {
    console.log('Hello, World!');
}
```

4. 저장 확인 (오른쪽 상단 "저장됨" 표시)
5. 왼쪽 리스트에서 다른 메모 선택
6. 다시 본 메모 선택
7. 모든 포맷팅이 그대로 유지되는지 확인

**예상 결과:**
```
□ 모든 형식이 올바르게 저장됨
□ 다시 로드해도 동일한 형식 유지
□ 각 기능별 스타일 모두 적용됨
□ 어두운 모드 전환 시에도 스타일 적용됨
```

---

## 🔍 브라우저 개발자 도구로 검증

### 1. Network 탭에서 저장 확인
```
1. F12 키로 개발자 도구 열기
2. Network 탭 선택
3. 메모 내용 입력
4. PUT /api/memos/[id] 요청 확인
5. Response에서 content 필드의 HTML 구조 확인
   - <ul>, <ol>, <blockquote>, <pre> 태그가 있는가?
   - inline style (style="...") 이 없는가?
```

### 2. Elements 탭에서 HTML 구조 확인
```
1. 메모 편집 상태
2. F12 → Elements 탭
3. memoContent div 선택
4. 아래와 같은 HTML 구조 확인:

<div id="memoContent" contenteditable="true">
  <p>텍스트</p>
  <ul>
    <li>항목</li>
  </ul>
  <ol>
    <li>항목</li>
  </ol>
  <blockquote>인용구</blockquote>
  <pre>코드</pre>
</div>
```

### 3. Console에서 에러 확인
```
1. F12 → Console 탭
2. 메모 입력/저장/로드 중 빨간 에러 메시지 없는지 확인
3. 경고(⚠️) 메시지만 있고 에러(❌) 없는지 확인
```

---

## ✅ 최종 검증 체크리스트

- [ ] 목록 생성 작동함
- [ ] 번호 목록 생성 작동함
- [ ] 인용구 스타일 유지됨
- [ ] 코드블록 스타일 유지됨
- [ ] 저장 후 다른 메모 갔다오기 → 스타일 유지
- [ ] 어두운 모드에서도 스타일 정상 표시
- [ ] 콘솔에 에러 메시지 없음
- [ ] Network에서 저장 요청 성공 (200-201)

---

## 🐛 문제 발생 시

### 목록이 생성되지 않는 경우
```
❌ 문제: 목록 버튼 클릭해도 아무것도 안 나타남
✅ 해결:
1. 메모 내용에 포커스가 있는지 확인 (클릭)
2. 브라우저 캐시 삭제 (Ctrl+Shift+Delete)
3. 페이지 새로고침 (Ctrl+R)
4. 콘솔 에러 메시지 확인
```

### 인용구/코드블록 스타일이 사라지는 경우
```
❌ 문제: 저장 후 불러오면 회색 배경이 없음
✅ 확인 사항:
1. Network 탭에서 저장된 HTML이 <blockquote>, <pre> 태그 포함하는가?
2. CSS 파일이 제대로 로드되었는가?
3. HTML의 style 태그에서 blockquote/pre 스타일 정의가 있는가?
```

### 목록이 저장되지 않는 경우
```
❌ 문제: 목록을 만들었는데 다른 메모 갔다오니 사라짐
✅ 확인:
1. 저장됨 표시가 나타났는가?
2. Network에서 PUT 요청이 성공했는가? (Status 200)
3. 콘솔에서 에러 메시지 확인
```

---

## 📁 수정된 파일

1. **frontend/index.html**
   - `<style>` 섹션에 CSS 추가
   - `#memoContent pre`, `blockquote`, `ul`, `ol` 스타일 정의

2. **frontend/script.js**
   - `insertCode()` 함수: inline style 제거
   - `insertQuote()` 함수: inline style 제거
   - `applyFormat()` 함수: 목록 생성 로직 개선

---

## 🎯 테스트 결과 제출

위 테스트를 모두 완료하면, 아래 정보를 기록해주세요:

```
테스트 환경:
- 브라우저: Chrome/Firefox/Safari
- OS: Windows/Mac/Linux
- 날짜: YYYY-MM-DD

✅ 통과한 테스트:
[ ] TEST 1: 목록
[ ] TEST 2: 번호 목록
[ ] TEST 3: 인용구
[ ] TEST 4: 코드블록
[ ] TEST 5: 조합 테스트

❌ 실패한 테스트: (있으면 작성)
-

🔍 추가 발견 사항:
-
```
