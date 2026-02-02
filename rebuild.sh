#!/bin/bash

clear

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   메모관리 앱 - 재빌드               ║"
echo "╚═══════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

echo "⚠️  주의: 이 작업은 시간이 걸릴 수 있습니다."
echo ""

read -p "진행하시겠습니까? (Y/N): " confirm

if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo ""
    echo "취소되었습니다."
    exit 0
fi

echo ""
echo "[1/4] 서비스 중지 중..."
docker compose down -v

echo ""
echo "[2/4] 이미지 삭제 중..."
docker rmi docker_test-frontend docker_test-backend 2>/dev/null || true

echo ""
echo "[3/4] 이미지 재빌드 중..."
docker compose build --no-cache

echo ""
echo "[4/4] 서비스 시작 중..."
docker compose up -d

echo ""
echo "✅ 재빌드 완료!"
echo ""
sleep 10
docker compose ps

echo ""
