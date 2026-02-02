@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════╗
echo ║   메모관리 앱 - Docker 시작           ║
echo ╚═══════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [1/3] 도커 컴포즈 시작 중...
docker compose up -d

echo.
echo [2/3] 서비스 상태 확인 중...
timeout /t 5 /nobreak

docker compose ps

echo.
echo [3/3] 브라우저 열기...
timeout /t 2 /nobreak

REM WSL2 IP 자동 감지
for /f "delims=" %%i in ('docker compose exec -T frontend hostname -I 2^>nul ^| findstr /r "[0-9]"') do (
    set IP=%%i
)

if "%IP%"=="" (
    echo.
    echo ⚠️  IP 자동 감지 실패
    echo 브라우저에서 다음 주소로 접속하세요:
    echo http://172.30.111.189
    echo.
) else (
    for /f "tokens=1" %%a in ("%IP%") do (
        set IP=%%a
        echo.
        echo ✅ 애플리케이션 시작 완료!
        echo.
        echo 📌 접속 주소:
        echo    http://!IP!
        echo.
        echo 🌐 브라우저에서 열기 (선택)...
        timeout /t 3 /nobreak
        start http://!IP!
    )
)

echo.
echo 💡 팁:
echo    - 로그 확인: logs.bat
echo    - 서비스 중지: stop.bat
echo    - 재빌드: rebuild.bat
echo.
pause
