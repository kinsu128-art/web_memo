#!/bin/bash

clear

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   메모관리 앱 - Docker 시작           ║"
echo "╚═══════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

echo "[1/4] 데이터 디렉토리 확인 중..."
mkdir -p data/mysql
chmod 777 data/mysql 2>/dev/null || true

echo ""
echo "[2/4] 도커 컴포즈 시작 중..."
docker compose up -d

echo ""
echo "[3/4] 서비스 상태 확인 중..."
sleep 5

docker compose ps

echo ""
echo "[4/4] 브라우저 열기..."
sleep 2

# 자동 IP 감지
IP=$(docker compose exec -T frontend hostname -I 2>/dev/null | awk '{print $1}')

if [ -z "$IP" ]; then
    echo ""
    echo "⚠️  IP 자동 감지 실패"
    echo "브라우저에서 다음 주소로 접속하세요:"
    echo "http://localhost"
    echo ""
else
    echo ""
    echo "✅ 애플리케이션 시작 완료!"
    echo ""
    echo "📌 접속 주소:"
    echo "   http://$IP"
    echo ""
    echo "🌐 브라우저에서 열기 (Linux의 경우 수동으로 접속하세요)..."
    sleep 3

    # Linux에서는 브라우저 자동 오픈 시도
    if command -v xdg-open &> /dev/null; then
        xdg-open "http://$IP" 2>/dev/null &
    elif command -v open &> /dev/null; then
        open "http://$IP" 2>/dev/null &
    fi
fi

echo ""
echo "💡 팁:"
echo "   - 로그 확인: ./logs.sh"
echo "   - 서비스 중지: ./stop.sh"
echo "   - 재빌드: ./rebuild.sh"
echo ""
