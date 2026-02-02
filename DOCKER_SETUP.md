# Docker 설치 및 설정 가이드

503 Service Unavailable 오류를 해결하기 위한 Docker 설치 가이드입니다.

---

## 🔍 문제 원인

```
503 Service Unavailable
HTTP Error 503. The service is unavailable.
```

**원인:** Docker 및 Docker Compose가 설치되지 않았거나, 서비스가 시작되지 않았습니다.

---

## 🖥️ Windows에서 Docker 설치

### 옵션 1: Docker Desktop (권장)

Docker Desktop은 Windows, Mac, Linux에서 모두 사용할 수 있는 공식 패키지입니다.

#### 사전 요구사항
- **Windows 10/11 Pro, Enterprise, Education 버전**
- **또는 Windows 10/11 Home (WSL 2 지원)**
- **최소 RAM: 4GB (권장 8GB+)**

#### 설치 절차

**1단계: Docker Desktop 다운로드**
```
https://www.docker.com/products/docker-desktop
```
- "Download for Windows" 클릭
- `Docker Desktop Installer.exe` 다운로드

**2단계: 설치 실행**
- 다운로드한 `.exe` 파일 더블 클릭
- "Install" 버튼 클릭
- 설치 완료 후 자동으로 재시작 (또는 수동 재시작)

**3단계: 설치 확인**
```bash
# PowerShell 또는 CMD에서 실행
docker --version
docker-compose --version

# 예상 출력:
# Docker version 24.0.0, build 0000000
# Docker Compose version 2.20.0
```

**4단계: Docker 서비스 시작**
- Docker Desktop 애플리케이션 실행
- 시스템 트레이에서 Docker 아이콘 확인 (움직이는 고래)
- "Docker is running" 상태 확인

---

### 옵션 2: WSL 2 (Windows Subsystem for Linux)

Windows 10/11 Home 사용자도 WSL 2를 통해 Docker를 사용할 수 있습니다.

#### 설치 절차

**1단계: WSL 2 활성화**
```powershell
# PowerShell (관리자 권한)에서 실행
wsl --install
```

**2단계: Linux 커널 업데이트 다운로드**
```
https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
```
- 다운로드 후 설치

**3단계: Docker Desktop 설치**
- 위의 Option 1 참고

**4단계: WSL 2를 기본으로 설정**
```powershell
wsl --set-default-version 2
```

---

## 🐧 Linux에서 Docker 설치

### Ubuntu/Debian

```bash
# 1. 기존 Docker 제거 (설치되어 있다면)
sudo apt-get remove docker docker-engine docker.io containerd runc

# 2. 저장소 설정
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# 3. Docker GPG 키 추가
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 4. 저장소 추가
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Docker 설치
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 6. Docker Compose 설치 (필요시)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 7. 설치 확인
docker --version
docker-compose --version
```

### CentOS/RHEL

```bash
# 1. 저장소 설정
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo

# 2. Docker 설치
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 3. Docker 서비스 시작
sudo systemctl start docker
sudo systemctl enable docker

# 4. 설치 확인
docker --version
docker-compose --version
```

---

## 🍎 Mac에서 Docker 설치

### Option 1: Docker Desktop (권장)

**1단계: Docker Desktop 다운로드**
```
https://www.docker.com/products/docker-desktop
```
- Intel Mac 또는 Apple Silicon Mac 버전 선택

**2단계: .dmg 파일 설치**
- 다운로드한 파일 더블 클릭
- "Applications" 폴더로 드래그

**3단계: 실행**
- Applications 폴더에서 Docker 실행
- 비밀번호 입력 (권한 요청 시)

**4단계: 확인**
```bash
docker --version
docker-compose --version
```

### Option 2: Homebrew를 통한 설치

```bash
# Homebrew 설치 (미설치 시)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Docker Desktop 설치
brew install --cask docker

# 또는 Docker CLI만 설치
brew install docker docker-compose
```

---

## ✅ Docker 설치 확인

### 1. Docker 버전 확인
```bash
docker --version
docker-compose --version
```

### 2. Docker 실행 테스트
```bash
docker run hello-world
```

**예상 출력:**
```
Hello from Docker!
This message shows that your installation appears to be working correctly.
...
```

### 3. 현재 상태 확인
```bash
docker ps
docker images
```

---

## 🚀 메모관리 앱 실행

Docker가 설치되었으면, 이제 애플리케이션을 실행할 수 있습니다.

### 1단계: Docker 서비스 시작
```bash
# Windows (Docker Desktop 실행)
# Mac/Linux는 자동으로 시작되거나 명시적 시작 필요
```

### 2단계: 프로젝트 디렉토리로 이동
```bash
cd D:\VibeCoding\docker_test
```

### 3단계: 서비스 시작
```bash
docker-compose up

# 또는 백그라운드
docker-compose up -d
```

### 4단계: 서비스 확인
```bash
# 다른 터미널에서
docker-compose ps

# 예상 출력:
# NAME            COMMAND                  SERVICE    STATUS
# memo_db         "docker-entrypoint..."   db         Up (healthy)
# memo_backend    "npm start"              backend    Up
# memo_frontend   "nginx -g daemon off"    frontend   Up
```

### 5단계: 브라우저에서 접속
```
http://localhost
```

---

## 🔧 일반적인 문제 및 해결

### 문제 1: "docker: command not found"

**원인:** Docker가 설치되지 않았거나 PATH에 등록되지 않음

**해결:**
```bash
# 다시 설치
# Windows: Docker Desktop 재설치
# Mac: brew install --cask docker
# Linux: apt-get install docker-ce

# 설치 후 재부팅
```

### 문제 2: "Cannot connect to Docker daemon"

**원인:** Docker 서비스가 실행 중이 아님

**해결:**
```bash
# Windows/Mac
# Docker Desktop 애플리케이션 실행

# Linux
sudo systemctl start docker
sudo systemctl enable docker

# 확인
docker ps
```

### 문제 3: "Permission denied while trying to connect"

**원인:** Linux에서 Docker 그룹 권한 없음

**해결:**
```bash
# Docker 그룹에 사용자 추가
sudo usermod -aG docker $USER

# 그룹 변경 적용 (재부팅 또는)
newgrp docker

# 확인
docker ps
```

### 문제 4: "Cannot locate Dockerfile"

**원인:** 잘못된 디렉토리에서 실행

**해결:**
```bash
# 올바른 디렉토리 확인
cd D:\VibeCoding\docker_test

# 파일 확인
ls -la docker-compose.yml
```

### 문제 5: 포트 충돌 (Address already in use)

**원인:** 80, 3000, 3306 포트가 이미 사용 중

**해결:**
```bash
# 실행 중인 프로세스 확인
# Windows
netstat -ano | findstr :80
netstat -ano | findstr :3000
netstat -ano | findstr :3306

# Linux/Mac
lsof -i :80
lsof -i :3000
lsof -i :3306

# 포트 번호 변경 (docker-compose.yml)
# ports:
#   - "8080:80"    # 80을 8080으로 변경
#   - "3001:3000"  # 3000을 3001로 변경
#   - "3307:3306"  # 3306을 3307로 변경
```

---

## 📋 시스템 요구사항

| 항목 | 최소값 | 권장값 |
|------|--------|--------|
| RAM | 2GB | 4GB 이상 |
| 디스크 | 2GB | 10GB 이상 |
| CPU | 1 Core | 2 Core 이상 |
| 네트워크 | 필수 | 고속 권장 |

---

## 🌐 방화벽 설정

Docker가 방화벽에 의해 차단되지 않도록 확인하세요.

### Windows 방화벽
- Docker Desktop에 네트워크 접근 허용
- Docker Desktop 설정 → Resources → Network 확인

### macOS
- System Preferences → Security & Privacy
- Docker에 대한 권한 확인

### Linux
```bash
# UFW (Ubuntu)
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp
sudo ufw allow 3306/tcp
sudo ufw allow 3307/tcp
```

---

## 🚀 설치 완료 후

Docker가 설치되었으면:

```bash
# 1. 프로젝트 디렉토리 이동
cd D:\VibeCoding\docker_test

# 2. 서비스 시작
docker-compose up

# 3. 브라우저에서 접속
# http://localhost

# 4. 로그 확인
docker-compose logs -f

# 5. 테스트
curl http://localhost:3000/api/memos
```

---

## 📚 추가 도움말

- **Docker 공식 문서**: https://docs.docker.com
- **Docker Desktop 설치**: https://www.docker.com/products/docker-desktop
- **Docker Compose 문서**: https://docs.docker.com/compose

---

**마지막 업데이트:** 2024-02-02
