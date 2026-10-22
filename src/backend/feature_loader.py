"""기능 라우터 자동 등록.

기능 하나는 features/<레포 이름>/ 폴더 하나이고, 그 안의 router.py 가 FastAPI APIRouter 를
`router` 라는 이름으로 내보낸다. 이 모듈이 그 router 를 /api/<레포 이름> 아래에 붙인다.
기능을 붙일 때 main.py 를 고칠 필요가 없다.
"""

import importlib
import logging
from pathlib import Path

from fastapi import FastAPI

log = logging.getLogger("uvicorn.error")


def load_features(app: FastAPI, features_dir: Path, package: str) -> list[str]:
    """features_dir 아래 기능의 router 를 app 에 붙이고, 불러오지 못한 기능의 이름을 돌려준다.

    레포 이름에 하이픈이 있으면 import 문을 쓸 수 없어 importlib 로 불러온다.
    기능마다 따로 시도해, 하나가 고장 나도 나머지는 뜬다. router.py 가 없는 폴더는 건너뛴다.
    """
    failed: list[str] = []
    if not features_dir.is_dir():
        return failed
    for folder in sorted(features_dir.iterdir()):
        if not (folder / "router.py").is_file():
            continue
        try:
            module = importlib.import_module(f"{package}.{folder.name}.router")
            app.include_router(module.router, prefix=f"/api/{folder.name}")
        except Exception:  # noqa: BLE001 — 기능 하나의 어떤 오류도 나머지 기능을 막지 않는다
            log.exception("기능을 불러오지 못했습니다: %s", folder.name)
            failed.append(folder.name)
    return failed
