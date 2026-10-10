"""数据库连接与初始化。

默认使用 SQLite（一键运行）；通过环境变量 DATABASE_URL 可切换到 PostgreSQL：
    set DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/jieqi
"""
from __future__ import annotations

import os
from pathlib import Path

from sqlmodel import Session, SQLModel, create_engine

BASE_DIR = Path(__file__).resolve().parents[2]

DEFAULT_SQLITE = f"sqlite:///{(BASE_DIR / 'jieqi.db').as_posix()}"
DATABASE_URL = os.getenv("DATABASE_URL", DEFAULT_SQLITE)

_connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, echo=False, connect_args=_connect_args)


def create_db_and_tables() -> None:
    """创建所有表（幂等）。"""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI 依赖：提供数据库会话。"""
    with Session(engine) as session:
        yield session
