# Jenkins가 npm build한 dist/ 를 그대로 이미지로 패키징
FROM nginx:alpine

# SPA 라우팅용 nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Jenkins stage('npm Build')에서 생성된 dist/ 복사
COPY dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
