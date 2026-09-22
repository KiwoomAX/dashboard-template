# 대시보드 백엔드 — uv 로 의존성을 설치하고 uvicorn 으로 실행한다.
# 빌드 컨텍스트는 레포 맨 위다(docker-compose.yml 의 context: .).
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONPATH=/app \
    UV_LINK_MODE=copy \
    PATH="/app/.venv/bin:$PATH"

# 사내망 인증서. certs/ 에 ePrism.crt 를 두면 시스템 신뢰 목록에 등록한다.
# 없으면 .gitkeep 만 복사되고 등록할 인증서가 없을 뿐 빌드는 계속된다.
COPY certs/ /usr/local/share/ca-certificates/
RUN update-ca-certificates
ENV REQUESTS_CA_BUNDLE=/etc/ssl/certs/ca-certificates.crt \
    SSL_CERT_FILE=/etc/ssl/certs/ca-certificates.crt

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# 의존성 파일만 먼저 복사한다. 코드만 바뀌면 이 레이어는 캐시를 쓴다.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

COPY src/backend ./src/backend

EXPOSE 8000

CMD ["uvicorn", "src.backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
