"""实体编目接口：节气、技术、作物、基因、环境因子、地区。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..database import get_session
from ..logic import NODE_LABEL, _relation_dict, build_node_index
from ..models import Environment, Gene, Organism, Region, Relation, Tech, Term

router = APIRouter(tags=["catalog"])


def _related(session: Session, entity_id: str) -> list[dict]:
    index = build_node_index(session)
    rels = session.exec(
        select(Relation).where((Relation.source_id == entity_id) | (Relation.target_id == entity_id))
    ).all()
    rels = sorted(rels, key=lambda r: -r.confidence)
    return [_relation_dict(r, index) for r in rels]


@router.get("/terms", summary="二十四节气列表")
def list_terms(
    season: str | None = Query(default=None, description="按季节过滤：春/夏/秋/冬"),
    session: Session = Depends(get_session),
):
    stmt = select(Term)
    if season:
        stmt = stmt.where(Term.season == season)
    rows = session.exec(stmt).all()
    rows = sorted(rows, key=lambda t: t.huangjing)
    return {"count": len(rows), "items": rows}


@router.get("/terms/{term_id}", summary="节气详情")
def get_term(term_id: str, session: Session = Depends(get_session)):
    row = session.get(Term, term_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"未找到节气: {term_id}")
    return {"item": row, "relations": _related(session, term_id)}


@router.get("/techs", summary="生物技术列表")
def list_techs(
    category: str | None = Query(default=None),
    session: Session = Depends(get_session),
):
    stmt = select(Tech)
    if category:
        stmt = stmt.where(Tech.category == category)
    rows = session.exec(stmt).all()
    rows = sorted(rows, key=lambda t: t.category)
    return {"count": len(rows), "items": rows}


@router.get("/techs/{tech_id}", summary="生物技术详情")
def get_tech(tech_id: str, session: Session = Depends(get_session)):
    row = session.get(Tech, tech_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"未找到生物技术: {tech_id}")
    return {"item": row, "relations": _related(session, tech_id)}


@router.get("/organisms", summary="作物/生物列表")
def list_organisms(session: Session = Depends(get_session)):
    rows = session.exec(select(Organism)).all()
    rows = sorted(rows, key=lambda o: (o.type, o.name))
    return {"count": len(rows), "items": rows}


@router.get("/organisms/{organism_id}", summary="作物/生物详情")
def get_organism(organism_id: str, session: Session = Depends(get_session)):
    row = session.get(Organism, organism_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"未找到生物对象: {organism_id}")
    return {"item": row, "relations": _related(session, organism_id)}


@router.get("/genes", summary="基因列表")
def list_genes(session: Session = Depends(get_session)):
    rows = session.exec(select(Gene)).all()
    return {"count": len(rows), "items": sorted(rows, key=lambda g: g.name)}


@router.get("/genes/{gene_id}", summary="基因详情")
def get_gene(gene_id: str, session: Session = Depends(get_session)):
    row = session.get(Gene, gene_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"未找到基因: {gene_id}")
    return {"item": row, "relations": _related(session, gene_id)}


@router.get("/environments", summary="环境因子列表")
def list_environments(session: Session = Depends(get_session)):
    rows = session.exec(select(Environment)).all()
    return {"count": len(rows), "items": sorted(rows, key=lambda e: e.name)}


@router.get("/environments/{env_id}", summary="环境因子详情")
def get_environment(env_id: str, session: Session = Depends(get_session)):
    row = session.get(Environment, env_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"未找到环境因子: {env_id}")
    return {"item": row, "relations": _related(session, env_id)}


@router.get("/regions", summary="地区列表")
def list_regions(session: Session = Depends(get_session)):
    rows = session.exec(select(Region)).all()
    return {"count": len(rows), "items": sorted(rows, key=lambda r: r.name)}


@router.get("/regions/{region_id}", summary="地区详情")
def get_region(region_id: str, session: Session = Depends(get_session)):
    row = session.get(Region, region_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"未找到地区: {region_id}")
    index = build_node_index(session)
    rels = session.exec(select(Relation).where(Relation.region == row.name)).all()
    rels = sorted(rels, key=lambda r: -r.confidence)
    return {"item": row, "relations": [_relation_dict(r, index) for r in rels]}


@router.get("/meta", summary="节点类型、证据等级等元信息")
def get_meta():
    return {
        "node_types": [{"type": k, "label": v} for k, v in NODE_LABEL.items()],
        "relation_types": ["解释", "指导", "突破", "适应", "案例"],
        "evidence_levels": ["强", "中", "弱", "待验证"],
        "source_types": ["古籍", "农谚", "论文", "标准", "专家意见", "示例"],
        "natures": ["传统经验", "现代科学机制"],
    }
