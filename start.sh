#!/bin/bash

clear

echo ""
echo "========================================="
echo "   메모관리 앱 - Docker 시작"
echo "========================================="
echo ""

cd "$(dirname "$0")"

echo "[1/3] 도커 컴포즈 시작 중..."
docker compose up -d

echo ""
echo "[2/3] 서비스 상태 확인 중..."
sleep 5

docker compose ps

echo ""
echo "[3/3] 완료!"
echo ""
echo "접속 주소: http://localhost"
echo "로그인: test@dklok.com / test123"
echo ""
echo "팁:"
echo "  - 로그 확인: ./logs.sh"
echo "  - 서비스 중지: ./stop.sh"
echo "  - 재빌드: ./rebuild.sh"
echo ""
