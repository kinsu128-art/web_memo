#!/bin/bash

clear

echo ""
echo "╔═══════════════════════════════════════╗"
echo "║   메모관리 앱 - 로그 확인             ║"
echo "╚═══════════════════════════════════════╝"
echo ""

cd "$(dirname "$0")"

echo "선택하세요:"
echo ""
echo "1. 전체 로그"
echo "2. 백엔드 로그"
echo "3. 프론트엔드 로그"
echo "4. 데이터베이스 로그"
echo "5. 종료"
echo ""

read -p "번호를 입력하세요 (1-5): " choice

case $choice in
    1)
        docker compose logs -f
        ;;
    2)
        docker compose logs -f backend
        ;;
    3)
        docker compose logs -f frontend
        ;;
    4)
        docker compose logs -f db
        ;;
    5)
        exit 0
        ;;
    *)
        echo ""
        echo "❌ 잘못된 선택입니다."
        ;;
esac
