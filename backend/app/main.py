"""jieqi-biotech-map 后端入口。

启动：
    uvicorn app.main:app --reload --port 8000   （在 backend/ 目录下执行）
文档：
    http://127.0.0.1:8000/docs
"""
from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import __version__
from .database import create_db_and_tables
from .routers import catalog, knowledge
from .seed import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    """启动时建表并（首次）导入种子数据。"""
    create_db_and_tables()
    app.state.seed_report = seed_database(force=False)
    yield


app = FastAPI(
    lifespan=lifespan,
    title="节气·生物技术关系平台 API",
    description=(
        "以二十四节气为时间轴、以生物技术为工具节点，展示二者在农业领域的"
        "解释、指导、突破、适应、案例关系。所有实体均携带权威科普链接。"
    ),
    version=__version__,
)

_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _origins if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router, prefix="/api")
app.include_router(knowledge.router, prefix="/api")


@app.get("/api/health", tags=["meta"], summary="健康检查")
def health():
    return {"status": "ok", "version": __version__}


@app.get("/api/seed-report", tags=["meta"], summary="种子数据加载与校验报告")
def seed_report():
    return getattr(app.state, "seed_report", {"loaded": None})
