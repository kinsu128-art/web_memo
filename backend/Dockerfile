# Node.js 베이스 이미지
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# curl 설치 (헬스체크용)
RUN apk add --no-cache curl

# package.json 복사
COPY package.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY src ./src

# 포트 3000 노출
EXPOSE 3000

# 애플리케이션 시작
CMD ["npm", "start"]
