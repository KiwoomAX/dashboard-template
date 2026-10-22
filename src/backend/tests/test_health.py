from fastapi.testclient import TestClient

from src.backend.main import app


def test_health_answers_ok():
    res = TestClient(app).get("/api/health")
    assert res.status_code == 200
    # 템플릿에는 기능이 없으므로 불러오지 못한 기능도 없다
    assert res.json() == {"status": "ok", "failed_features": []}
