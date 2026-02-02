@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════╗
echo ║   메모관리 앱 - 상태 확인             ║
echo ╚═══════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo [*] 서비스 상태:
echo.
docker compose ps

echo.
echo [*] 포트 정보:
echo.
docker compose port frontend 80
docker compose port backend 3000
docker compose port db 3306

echo.
echo [*] API 테스트:
echo.
curl -s http://localhost:3000/api/memos | findstr "success" >nul
if %errorlevel% equ 0 (
    echo ✅ 백엔드: 정상 (HTTP 응답 확인)
) else (
    echo ❌ 백엔드: 응답 없음
)

echo.
pause
