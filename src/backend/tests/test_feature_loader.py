"""기능 라우터 자동 등록 시험.

기능은 features/<레포 이름>/router.py 에 있고, 레포 이름에는 하이픈이 들 수 있다.
시험마다 임시 폴더에 가짜 기능 묶음을 만들고, 시험마다 다른 패키지 이름으로 불러온다.
"""

import sys
import uuid
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.backend.feature_loader import load_features

OK_ROUTER = """\
from fastapi import APIRouter

from .service import greet

router = APIRouter()


@router.get("/ping")
def ping() -> dict[str, str]:
    return {"msg": greet()}
"""

OK_SERVICE = """\
def greet() -> str:
    return "hello"
"""

BROKEN_ROUTER = "import module_that_does_not_exist  # noqa: F401\n"


@pytest.fixture
def features(tmp_path, monkeypatch):
    """임시 기능 묶음 폴더와 그 패키지 이름을 돌려준다. 끝나면 불러온 모듈을 치운다."""
    package = f"fx_{uuid.uuid4().hex[:8]}"
    base = tmp_path / package
    base.mkdir()
    monkeypatch.syspath_prepend(str(tmp_path))
    yield base, package
    for name in [m for m in sys.modules if m == package or m.startswith(f"{package}.")]:
        del sys.modules[name]


def make_feature(base: Path, name: str, router: str | None, service: str | None = None) -> None:
    folder = base / name
    folder.mkdir()
    if router is not None:
        (folder / "router.py").write_text(router, encoding="utf-8")
    if service is not None:
        (folder / "service.py").write_text(service, encoding="utf-8")


def test_registers_router_under_api_prefix(features):
    base, package = features
    make_feature(base, "email-summary", OK_ROUTER, OK_SERVICE)
    app = FastAPI()

    failed = load_features(app, base, package)

    assert failed == []
    res = TestClient(app).get("/api/email-summary/ping")
    assert res.status_code == 200
    assert res.json() == {"msg": "hello"}


def test_broken_feature_is_skipped_and_reported(features):
    base, package = features
    make_feature(base, "good", OK_ROUTER, OK_SERVICE)
    make_feature(base, "broken-feature", BROKEN_ROUTER)
    app = FastAPI()

    failed = load_features(app, base, package)

    assert failed == ["broken-feature"]
    client = TestClient(app)
    assert client.get("/api/good/ping").status_code == 200
    assert client.get("/api/broken-feature/ping").status_code == 404


def test_folder_without_router_is_ignored(features):
    base, package = features
    make_feature(base, "docs-only", None)
    app = FastAPI()

    failed = load_features(app, base, package)

    assert failed == []
    assert TestClient(app).get("/api/docs-only/ping").status_code == 404


def test_missing_features_dir_registers_nothing(tmp_path):
    app = FastAPI()

    assert load_features(app, tmp_path / "nope", "nope") == []
