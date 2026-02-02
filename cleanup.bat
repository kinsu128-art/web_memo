@echo off
chcp 65001 >nul
cls

echo.
echo ╔═══════════════════════════════════════╗
echo ║   메모관리 앱 - 완전 정리             ║
echo ╚═══════════════════════════════════════╝
echo.

cd /d "%~dp0"

echo ⚠️  경고: 모든 데이터가 삭제됩니다!
echo.
echo 다음이 삭제됩니다:
echo   - 모든 컨테이너
echo   - 모든 이미지
echo   - 모든 볼륨 (데이터베이스 포함)
echo.
echo 진행하시겠습니까? (Y/N)
set /p confirm="선택: "

if /i not "%confirm%"=="Y" (
    echo.
    echo 취소되었습니다.
    pause
    exit /b 0
)

echo.
echo [1/3] 컨테이너 중지 및 삭제...
docker compose down -v --remove-orphans

echo.
echo [2/3] 이미지 삭제...
docker rmi docker_test-frontend docker_test-backend 2>nul

echo.
echo [3/3] Docker 시스템 정리...
docker system prune -f

echo.
echo ✅ 완전 정리 완료!
echo.
echo 💡 다시 시작하려면: start.bat
echo.
pause
