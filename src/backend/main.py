"""본부 대시보드 백엔드.

기능 API 는 모두 /api/ 아래에 붙인다. nginx 가 /api/ 로 시작하는 요청만 이 서버로 넘기므로
그 밖의 주소는 화면에서 닿지 않는다. 기능끼리 겹치지 않게 /api/<기능 이름> 을 권장한다.
"""

from fastapi import FastAPI

app = FastAPI(title="dashboard-template")


@app.get("/api/health")
def health() -> dict[str, str]:
    """서버가 떠 있는지 알린다."""
    return {"status": "ok"}
