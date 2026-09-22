# 대시보드 프론트 — 화면을 빌드한 뒤 nginx 가 내보낸다.
# 빌드 컨텍스트는 레포 맨 위다(docker-compose.yml 의 context: .). certs/ 와 소스를 함께 봐야 해서다.
# 무엇을 빌드에 올리는지는 옆의 Dockerfile.dockerignore 가 정한다.
FROM node:20-alpine AS builder

# 사내망 인증서. 인증서 검증은 끄지 않고 사내 인증서를 믿게 한다(배포 스킬 규칙).
# node 는 시스템 인증서 저장소를 보지 않고 NODE_EXTRA_CA_CERTS 하나만 본다.
# certs/ePrism.crt 가 없으면 node 가 경고만 찍고 계속한다. 젠킨스는 빌드마다 certs/ 를 복원한다.
COPY certs/ /usr/local/share/ca-certificates/
ENV NODE_EXTRA_CA_CERTS=/usr/local/share/ca-certificates/ePrism.crt

WORKDIR /app

COPY src/frontend/package.json src/frontend/package-lock.json ./
RUN npm ci

COPY src/frontend/ ./
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY src/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
