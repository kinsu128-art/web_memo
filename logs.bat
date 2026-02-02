@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════╗
echo ║   메모관리 앱 - 로그 확인             ║
echo ╚═══════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo 선택하세요:
echo.
echo 1. 전체 로그
echo 2. 백엔드 로그
echo 3. 프론트엔드 로그
echo 4. 데이터베이스 로그
echo 5. 종료
echo.

set /p choice="번호를 입력하세요 (1-5): "

if "%choice%"=="1" (
    docker compose logs -f
) else if "%choice%"=="2" (
    docker compose logs -f backend
) else if "%choice%"=="3" (
    docker compose logs -f frontend
) else if "%choice%"=="4" (
    docker compose logs -f db
) else if "%choice%"=="5" (
    exit /b 0
) else (
    echo.
    echo ❌ 잘못된 선택입니다.
    pause
)
