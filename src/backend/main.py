"""본부 대시보드 백엔드.

기능 API 는 모두 /api/ 아래에 붙인다. nginx 가 /api/ 로 시작하는 요청만 이 서버로 넘기므로
그 밖의 주소는 화면에서 닿지 않는다.

기능은 features/<기능 이름>/router.py 에 두면 /api/<기능 이름> 아래에 저절로 붙는다.
기능을 붙일 때 이 파일을 고치지 않는다.
"""

from pathlib import Path

from fastapi import FastAPI

from src.backend.feature_loader import load_features

app = FastAPI(title="dashboard-template")

# 불러오지 못한 기능의 이름. 기능 하나가 고장 나도 나머지는 뜨고, 고장 난 기능은 여기에 남는다.
failed_features = load_features(app, Path(__file__).parent / "features", "src.backend.features")


@app.get("/api/health")
def health() -> dict:
    """서버가 떠 있는지 알린다. 불러오지 못한 기능이 있으면 그 이름도 알린다."""
    return {"status": "ok", "failed_features": failed_features}
