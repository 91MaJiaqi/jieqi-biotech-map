"""图谱、检索、农事建议与气候模拟的业务逻辑。"""
from __future__ import annotations

from typing import Any

from sqlmodel import Session, select

from .models import Environment, Gene, Organism, Region, Relation, Tech, Term

DISCLAIMER = "以上建议仅供参考，不替代当地农技部门指导。"

NODE_LABEL = {
    "term": "节气",
    "tech": "生物技术",
    "organism": "作物/生物",
    "gene": "基因",
    "environment": "环境因子",
    "region": "地区",
}

ENTITY_SOURCES = [
    ("term", Term),
    ("tech", Tech),
    ("organism", Organism),
    ("gene", Gene),
    ("environment", Environment),
    ("region", Region),
]


def build_node_index(session: Session) -> dict[str, dict[str, Any]]:
    """构建 实体id -> 节点信息 的索引。"""
    index: dict[str, dict[str, Any]] = {}
    for kind, model in ENTITY_SOURCES:
        for row in session.exec(select(model)).all():
            index[row.id] = {
                "id": row.id,
                "name": row.name,
                "type": kind,
                "type_label": NODE_LABEL[kind],
                "url": row.url,
                "url_title": row.url_title,
            }
    return index


def _relation_dict(rel: Relation, index: dict[str, dict[str, Any]]) -> dict[str, Any]:
    src = index.get(rel.source_id, {"name": rel.source_id, "type": "unknown", "type_label": "未知"})
    tgt = index.get(rel.target_id, {"name": rel.target_id, "type": "unknown", "type_label": "未知"})
    return {
        "id": rel.id,
        "source": rel.source_id,
        "target": rel.target_id,
        "source_name": src["name"],
        "target_name": tgt["name"],
        "source_type": src["type"],
        "target_type": tgt["type"],
        "type": rel.type,
        "description": rel.description,
        "nature": rel.nature,
        "evidence_level": rel.evidence_level,
        "source_ref_type": rel.source_type,
        "source_ref": rel.source_ref,
        "region": rel.region,
        "season": rel.season,
        "confidence": rel.confidence,
    }


def build_graph(
    session: Session,
    term: str | None = None,
    tech: str | None = None,
    region: str | None = None,
) -> dict[str, Any]:
    """按过滤条件构建关系图谱。"""
    index = build_node_index(session)
    relations = session.exec(select(Relation)).all()

    filtered: list[Relation] = []
    for rel in relations:
        endpoints = {rel.source_id, rel.target_id}
        if term and term not in endpoints:
            continue
        if tech and tech not in endpoints:
            continue
        if region and rel.region not in (region, "全国", None):
            continue
        filtered.append(rel)

    used_ids: set[str] = set()
    links = []
    for rel in filtered:
        links.append(_relation_dict(rel, index))
        used_ids.update({rel.source_id, rel.target_id})

    # 若指定了过滤条件，额外纳入该实体本身
    for key in (term, tech, region):
        if key:
            used_ids.add(key)

    nodes = [index[i] for i in used_ids if i in index]
    nodes.sort(key=lambda n: (n["type"], n["name"]))

    relation_types = sorted({rel.type for rel in filtered})
    return {
        "nodes": nodes,
        "links": links,
        "stats": {
            "node_count": len(nodes),
            "link_count": len(links),
            "relation_types": relation_types,
            "filters": {"term": term, "tech": tech, "region": region},
        },
        "node_types": [{"type": k, "label": v} for k, v in NODE_LABEL.items()],
    }


def search(session: Session, q: str, limit: int = 30) -> dict[str, Any]:
    """跨实体检索。"""
    q = (q or "").strip()
    if not q:
        return {"query": q, "count": 0, "results": []}

    needle = q.lower()
    results: list[dict[str, Any]] = []

    def hit(*fields: str) -> bool:
        return any(needle in (f or "").lower() for f in fields)

    for row in session.exec(select(Term)).all():
        if hit(row.name, row.phenology, row.climate, row.proverb or "", row.season):
            results.append({
                "id": row.id, "type": "term", "type_label": "节气", "name": row.name,
                "desc": f"{row.season}·{row.date}｜物候：{row.phenology}",
                "url": row.url, "url_title": row.url_title,
            })
    for row in session.exec(select(Tech)).all():
        if hit(row.name, row.description, row.category, row.scenarios):
            results.append({
                "id": row.id, "type": "tech", "type_label": "生物技术", "name": row.name,
                "desc": row.description,
                "url": row.url, "url_title": row.url_title,
            })
    for row in session.exec(select(Organism)).all():
        if hit(row.name, row.type):
            results.append({
                "id": row.id, "type": "organism", "type_label": "作物/生物", "name": row.name,
                "desc": f"{row.type}",
                "url": row.url, "url_title": row.url_title,
            })
    for row in session.exec(select(Gene)).all():
        if hit(row.name, row.function, row.organism):
            results.append({
                "id": row.id, "type": "gene", "type_label": "基因", "name": row.name,
                "desc": row.function,
                "url": row.url, "url_title": row.url_title,
            })
    for row in session.exec(select(Environment)).all():
        if hit(row.name, row.effect, row.unit):
            results.append({
                "id": row.id, "type": "environment", "type_label": "环境因子", "name": row.name,
                "desc": f"{row.effect}（单位：{row.unit}）",
                "url": row.url, "url_title": row.url_title,
            })
    for row in session.exec(select(Region)).all():
        if hit(row.name, row.climate_zone, row.crops):
            results.append({
                "id": row.id, "type": "region", "type_label": "地区", "name": row.name,
                "desc": f"{row.climate_zone}｜典型作物：{row.crops}",
                "url": row.url, "url_title": row.url_title,
            })

    results.sort(key=lambda r: (r["name"].lower().find(needle), r["type"]))
    results = results[:limit]
    return {"query": q, "count": len(results), "results": results}


def suggest_advice(
    session: Session,
    region: str | None = None,
    crop: str | None = None,
    term: str | None = None,
) -> dict[str, Any]:
    """基于关系数据生成农事/技术建议。"""
    index = build_node_index(session)
    region_map = {r.id: r for r in session.exec(select(Region)).all()}
    term_map = {t.id: t for t in session.exec(select(Term)).all()}
    org_map = {o.id: o for o in session.exec(select(Organism)).all()}

    region_row = region_map.get(region) if region else None
    region_label = region_row.name if region_row else None
    term_row = term_map.get(term) if term else None
    crop_row = org_map.get(crop) if crop else None

    scored: list[tuple[int, Relation]] = []
    for rel in session.exec(select(Relation)).all():
        endpoints = {rel.source_id, rel.target_id}
        score = 0
        if term and term in endpoints:
            score += 1
        if crop and crop in endpoints:
            score += 1
        if region_label and rel.region in (region_label, "全国"):
            score += 1
        if score > 0:
            scored.append((score, rel))

    scored.sort(key=lambda x: (-x[0], -x[1].confidence))
    top = [rel for _, rel in scored[:8]]

    suggestions: list[dict[str, Any]] = []
    risks: list[dict[str, Any]] = []
    tech_ids: set[str] = set()

    for rel in top:
        item = _relation_dict(rel, index)
        if rel.type in {"指导", "案例", "适应"}:
            suggestions.append(item)
        if rel.evidence_level in {"弱", "待验证"} or rel.type == "适应":
            risks.append(item)
        for eid in (rel.source_id, rel.target_id):
            if index.get(eid, {}).get("type") == "tech":
                tech_ids.add(eid)

    technologies = [index[t] for t in sorted(tech_ids)]

    # 传统经验（农谚）与现代科学机制分开呈现
    traditional = term_row.proverb if term_row else None
    modern = [
        {"title": index[r.target_id]["name"] if r.target_id in index else r.target_id,
         "desc": r.description, "evidence_level": r.evidence_level, "source_ref": r.source_ref}
        for r in top if r.nature == "现代科学机制"
    ]

    return {
        "query": {
            "region": region_label, "crop": crop_row.name if crop_row else None,
            "term": term_row.name if term_row else None,
        },
        "region_info": (
            {"id": region_row.id, "name": region_row.name, "climate_zone": region_row.climate_zone,
             "crops": region_row.crops, "url": region_row.url, "url_title": region_row.url_title}
            if region_row else None
        ),
        "term_info": (
            {"id": term_row.id, "name": term_row.name, "season": term_row.season,
             "date": term_row.date, "phenology": term_row.phenology,
             "url": term_row.url, "url_title": term_row.url_title}
            if term_row else None
        ),
        "traditional_experience": traditional,
        "modern_mechanisms": modern,
        "suggestions": suggestions,
        "risks": risks,
        "technologies": technologies,
        "disclaimer": DISCLAIMER,
    }


# 季节物候对升温的示意敏感度（天/℃，示意估算，非精确预报）
_SEASON_SENSITIVITY = {"春": 3.0, "夏": 2.0, "秋": 3.0, "冬": 2.0}


def climate_scenario(session: Session, delta: float = 1.0) -> dict[str, Any]:
    """升温情景下的物候偏移与应对技术（示意模型，待核验）。"""
    delta = max(0.0, min(4.0, float(delta)))
    terms = session.exec(select(Term)).all()

    items = []
    for t in sorted(terms, key=lambda x: x.huangjing):
        factor = _SEASON_SENSITIVITY.get(t.season, 2.0)
        shift = round(delta * factor, 1)
        items.append({
            "id": t.id, "name": t.name, "season": t.season, "date": t.date,
            "huangjing": t.huangjing,
            "shift_days": shift,
            "direction": "提前" if shift > 0 else "不变",
            "note": f"示意：物候期约{'提前' if shift > 0 else '无明显变化'}{abs(shift)}天",
            "url": t.url, "url_title": t.url_title,
        })

    techs = session.exec(select(Tech)).all()
    adapt_ids = {"facility_agriculture", "genomic_selection", "mas_breeding", "rnai", "microbial_fertilizer"}
    technologies = [
        {"id": x.id, "name": x.name, "category": x.category, "description": x.description,
         "url": x.url, "url_title": x.url_title}
        for x in techs if x.id in adapt_ids
    ]

    impacts = [
        "升温使春季物候普遍提前，需重新校准播期与品种熟期。",
        "冬季偏暖可能削弱冬小麦春化满足度，影响分蘖与成穗。",
        "暖冬与高温有利于病虫害越冬与繁殖，病害风险上升。",
        "积温增加可能使多熟制北界移动，但需同步评估水分与霜冻风险。",
    ]

    return {
        "delta": delta,
        "unit": "℃",
        "model": "示意模型（待核验）：按季节设定物候敏感度系数，非精确预报",
        "impacts": impacts,
        "terms": items,
        "technologies": technologies,
        "disclaimer": DISCLAIMER,
    }
