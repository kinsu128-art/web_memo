# 메모관리 앱 - 배치파일 사용 가이드

Windows 배치파일을 통해 Docker를 쉽게 관리할 수 있습니다.

---

## 📁 배치파일 목록

### 1️⃣ **start.bat** - 애플리케이션 시작
```bash
더블클릭 또는
start.bat
```

**기능:**
- Docker 컴포즈 시작
- 서비스 상태 확인
- 브라우저 자동 열기 (선택사항)
- WSL2 IP 자동 감지

**사용 예:**
```
D:\VibeCoding\docker_test\start.bat
```

---

### 2️⃣ **stop.bat** - 애플리케이션 중지
```bash
더블클릭 또는
stop.bat
```

**기능:**
- 모든 컨테이너 중지
- 포트 해제

**사용 예:**
```
D:\VibeCoding\docker_test\stop.bat
```

---

### 3️⃣ **status.bat** - 상태 확인
```bash
더블클릭 또는
status.bat
```

**기능:**
- 서비스 상태 표시
- 포트 정보 확인
- API 연결성 테스트

**출력 예:**
```
NAME            STATUS
memo_backend    Up
memo_db         Up (healthy)
memo_frontend   Up (healthy)

포트 80 -> 80 (프론트엔드)
포트 3000 -> 3000 (백엔드)
포트 3306 -> 3306 (DB)
```

---

### 4️⃣ **logs.bat** - 로그 확인
```bash
더블클릭 또는
logs.bat
```

**기능:**
- 서비스별 로그 선택 조회
- 실시간 로그 스트리밍

**옵션:**
```
1. 전체 로그
2. 백엔드 로그
3. 프론트엔드 로그
4. 데이터베이스 로그
5. 종료
```

---

### 5️⃣ **rebuild.bat** - 재빌드
```bash
더블클릭 또는
rebuild.bat
```

**기능:**
- 이미지 재빌드 (코드 변경 후)
- 캐시 비우기
- 서비스 재시작

**사용 시기:**
- HTML, CSS, JavaScript 파일 수정 후
- 백엔드 코드 변경 후

---

### 6️⃣ **cleanup.bat** - 완전 정리
```bash
더블클릭 또는
cleanup.bat
```

**기능:**
- 모든 컨테이너 삭제
- 모든 이미지 삭제
- 모든 데이터 삭제 (주의!)

**⚠️ 경고:**
데이터베이스의 모든 메모가 삭제됩니다!

---

## 🚀 빠른 시작

### 첫 실행
```
1. start.bat 더블클릭
2. 브라우저가 자동으로 열림
3. 또는 http://172.30.111.189 접속
```

### 일상적 사용
```
아침:  start.bat        (시작)
작업:  애플리케이션 사용
저녁:  stop.bat         (중지)
```

### 문제 발생 시
```
1. status.bat           (현재 상태 확인)
2. logs.bat             (오류 로그 확인)
3. rebuild.bat          (재빌드)
4. cleanup.bat + start.bat (완전 초기화)
```

---

## 📋 실행 방법

### 방법 1: 더블클릭
Windows 탐색기에서 `.bat` 파일을 더블클릭

### 방법 2: 명령 프롬프트
```cmd
cd D:\VibeCoding\docker_test
start.bat
```

### 방법 3: PowerShell
```powershell
cd D:\VibeCoding\docker_test
.\start.bat
```

### 방법 4: 바탕화면 바로가기 생성
1. `start.bat` 우클릭
2. "바로가기 보내기" → "바탕화면"
3. 바탕화면 바로가기 더블클릭

---

## 🔧 커스터마이징

### WSL2 IP 고정하기

`start.bat`에서 자동으로 IP를 감지합니다.

만약 IP가 자주 변한다면, 직접 입력:
```
http://172.30.111.189
http://172.30.111.190
```

### 브라우저 자동 열기 비활성화

`start.bat` 파일 편집:
```batch
REM 이 줄을 주석 처리
REM start http://!IP!
```

---

## 💡 팁

### 1. 작업 스케줄러에 등록
Windows 작업 스케줄러에 `start.bat` 등록하면 부팅 시 자동 시작 가능

### 2. 로그 파일로 저장
```cmd
logs.bat > logs.txt 2>&1
```

### 3. 백업 전에 데이터 확인
```cmd
status.bat
```

---

## 🐛 트러블슈팅

### Q: "Docker is not recognized"
**A:** Docker Desktop이 설치되지 않았거나 PATH에 등록되지 않음
- Docker Desktop 설치 확인
- 재부팅

### Q: 포트가 이미 사용 중입니다
**A:** 다른 애플리케이션이 포트 사용 중
```cmd
stop.bat
```

### Q: 데이터가 날아갔습니다
**A:** `cleanup.bat` 때문일 수 있음
- 백업이 있으면 복구
- 이후 더 신중하게 사용

---

## 📞 도움말

각 배치파일의 상세 정보:
```
start.bat    - 시작 및 브라우저 열기
stop.bat     - 중지
status.bat   - 상태 확인
logs.bat     - 로그 조회
rebuild.bat  - 재빌드
cleanup.bat  - 완전 정리
```

---

**Happy coding! 🚀**
