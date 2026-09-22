from fastapi.testclient import TestClient

from src.backend.main import app


def test_health_answers_ok():
    res = TestClient(app).get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}
