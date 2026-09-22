# 대시보드 프론트 — 화면을 빌드한 뒤 nginx 가 내보낸다.
FROM node:20-alpine AS builder

# 사내망은 인증서를 바꿔 끼우므로 npm 의 인증서 검증을 끈다(챗봇 프론트와 같은 설정).
ENV NPM_CONFIG_STRICT_SSL=false

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
