#!/bin/bash

clear

echo ""
echo "========================================="
echo "   메모관리 앱 - 재빌드"
echo "========================================="
echo ""

cd "$(dirname "$0")"

echo "주의: 이 작업은 시간이 걸릴 수 있습니다."
echo ""
echo "선택:"
echo "1. 재빌드 (데이터 유지) - 권장"
echo "2. 완전 초기화 (데이터 삭제)"
echo "0. 취소"
echo ""

read -p "번호를 선택하세요 (0-2): " choice

if [[ "$choice" == "0" ]]; then
    echo ""
    echo "취소되었습니다."
    exit 0
elif [[ "$choice" == "1" ]]; then
    echo ""
    echo "[1/4] 서비스 중지 중... (데이터 유지)"
    docker compose down

    echo ""
    echo "[2/4] 이미지 삭제 중..."
    docker rmi memo_web-frontend memo_web-backend 2>/dev/null || true

    echo ""
    echo "[3/4] 이미지 재빌드 중..."
    docker compose build --no-cache

    echo ""
    echo "[4/4] 서비스 시작 중..."
    docker compose up -d

elif [[ "$choice" == "2" ]]; then
    echo ""
    read -p "정말 모든 데이터를 삭제하시겠습니까? (Y/N): " confirm

    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "취소되었습니다."
        exit 0
    fi

    echo ""
    echo "[1/4] 서비스 중지 및 볼륨 삭제 중..."
    docker compose down -v

    echo ""
    echo "[2/4] 이미지 삭제 중..."
    docker rmi memo_web-frontend memo_web-backend 2>/dev/null || true

    echo ""
    echo "[3/4] 이미지 재빌드 중..."
    docker compose build --no-cache

    echo ""
    echo "[4/4] 서비스 시작 중..."
    docker compose up -d
else
    echo "잘못된 선택입니다."
    exit 1
fi

echo ""
echo "재빌드 완료!"
echo ""
sleep 10
docker compose ps

echo ""
