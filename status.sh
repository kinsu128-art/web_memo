#!/bin/bash

clear

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   메모관리 앱 - 상태 확인             ║"
echo "╚═══════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

echo "[*] 서비스 상태:"
echo ""
docker compose ps

echo ""
echo "[*] 포트 정보:"
echo ""
docker compose port frontend 80 || echo "frontend: 대기 중"
docker compose port backend 3000 || echo "backend: 대기 중"
docker compose port db 3306 || echo "db: 대기 중"

echo ""
echo "[*] API 테스트:"
echo ""

if curl -s http://localhost:3000/api/memos | grep -q "success"; then
    echo "✅ 백엔드: 정상 (HTTP 응답 확인)"
else
    echo "❌ 백엔드: 응답 없음"
fi

echo ""
