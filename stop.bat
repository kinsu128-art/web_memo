@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════╗
echo ║   메모관리 앱 - Docker 중지           ║
echo ╚═══════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [*] 도커 컴포즈 중지 중...
docker compose down

echo.
echo ✅ 모든 서비스가 중지되었습니다.
echo.
pause
