# Nginx 베이스 이미지
FROM nginx:alpine

# 기본 Nginx 설정 제거
RUN rm /etc/nginx/conf.d/default.conf

# 커스텀 Nginx 설정 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 웹 페이지 파일만 복사 (HTML, CSS, JS만)
COPY index.html /usr/share/nginx/html/
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/

# 포트 80 노출
EXPOSE 80

# Nginx 시작
CMD ["nginx", "-g", "daemon off;"]
