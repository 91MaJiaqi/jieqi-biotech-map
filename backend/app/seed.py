"""种子数据加载与校验。

- 从 data/seed.json 读取种子数据写入 SQLite。
- 校验所有科普链接是否来自允许的权威域名。
- 校验关系两端的实体 id 是否存在。
"""
from __future__ import annotations

import json
from pathlib import Path
from urllib.parse import urlparse

from sqlmodel import Session, select

from .database import BASE_DIR, engine
from .models import (
    Environment,
    Evidence,
    Gene,
    Organism,
    Region,
    Relation,
    Tech,
    Term,
)

SEED_PATH = BASE_DIR / "data" / "seed.json"

_MODEL_BY_KEY = {
    "terms": Term,
    "techs": Tech,
    "organisms": Organism,
    "genes": Gene,
    "environments": Environment,
    "regions": Region,
    "relations": Relation,
    "evidences": Evidence,
}


def load_seed_data(path: Path | None = None) -> dict:
    """读取种子 JSON。"""
    p = path or SEED_PATH
    with p.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def allowed_domains(data: dict) -> set[str]:
    return set(data.get("meta", {}).get("allowed_domains", []))


def check_url(url: str, domains: set[str]) -> bool:
    """判断 url 是否属于允许的权威域名（含子域）。"""
    try:
        host = (urlparse(url).hostname or "").lower()
    except ValueError:
        return False
    if not host:
        return False
    return any(host == d or host.endswith("." + d) for d in domains)


def validate(data: dict) -> dict:
    """结构 + 链接 + 关系完整性校验，返回统计信息。"""
    domains = allowed_domains(data)
    problems: list[str] = []
    counts: dict[str, int] = {}

    entity_ids: set[str] = set()
    for key in ("terms", "techs", "organisms", "genes", "environments", "regions"):
        for item in data.get(key, []):
            counts[key] = counts.get(key, 0) + 1
            if item["id"] in entity_ids:
                problems.append(f"重复实体 id: {item['id']}")
            entity_ids.add(item["id"])
            if not check_url(item["url"], domains):
                problems.append(f"非权威链接 [{key}:{item['id']}]: {item['url']}")

    for rel in data.get("relations", []):
        counts["relations"] = counts.get("relations", 0) + 1
        for side in ("source_id", "target_id"):
            if rel[side] not in entity_ids:
                problems.append(f"关系端点不存在 [{side}={rel[side]}]")
        if rel.get("evidence_level") not in {"强", "中", "弱", "待验证"}:
            problems.append(f"非法证据等级: {rel.get('evidence_level')}")
        if rel.get("source_type") not in {"古籍", "农谚", "论文", "标准", "专家意见", "示例"}:
            problems.append(f"非法来源类型: {rel.get('source_type')}")

    for ev in data.get("evidences", []):
        counts["evidences"] = counts.get("evidences", 0) + 1

    return {"counts": counts, "problems": problems}


def seed_database(force: bool = False) -> dict:
    """把种子数据写入数据库。force=True 时先清空已有数据。"""
    data = load_seed_data()
    report = validate(data)

    with Session(engine) as session:
        existing = session.exec(select(Term)).first()
        if existing and not force:
            return {"loaded": False, "reason": "数据库已有数据，跳过", **report}

        if force:
            for model in (Relation, Evidence, Term, Tech, Organism, Gene, Environment, Region):
                for row in session.exec(select(model)).all():
                    session.delete(row)
            session.commit()

        for key, model in _MODEL_BY_KEY.items():
            for item in data.get(key, []):
                session.add(model(**item))
        session.commit()

    return {"loaded": True, **report}
