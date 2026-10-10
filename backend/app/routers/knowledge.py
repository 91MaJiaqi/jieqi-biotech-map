"""知识接口：图谱、检索、农事建议、气候模拟、证据。"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from ..database import get_session
from ..logic import build_graph, climate_scenario, search as do_search, suggest_advice
from ..models import Evidence

router = APIRouter(tags=["knowledge"])


@router.get("/graph", summary="关系图谱（可按节气/技术/地区过滤）")
def get_graph(
    term: str | None = Query(default=None, description="节气 id"),
    tech: str | None = Query(default=None, description="生物技术 id"),
    region: str | None = Query(default=None, description="地区名称，如 华北"),
    session: Session = Depends(get_session),
):
    return build_graph(session, term=term, tech=tech, region=region)


@router.get("/search", summary="跨实体检索")
def get_search(
    q: str = Query(default="", description="关键词"),
    limit: int = Query(default=30, ge=1, le=100),
    session: Session = Depends(get_session),
):
    return do_search(session, q, limit=limit)


@router.get("/advice", summary="农事/技术建议")
def get_advice(
    region: str | None = Query(default=None),
    crop: str | None = Query(default=None),
    term: str | None = Query(default=None),
    session: Session = Depends(get_session),
):
    return suggest_advice(session, region=region, crop=crop, term=term)


@router.get("/climate", summary="气候模拟（升温情景）")
def get_climate(
    delta: float = Query(default=1.0, ge=0.0, le=4.0, description="升温幅度，单位℃"),
    session: Session = Depends(get_session),
):
    return climate_scenario(session, delta=delta)


@router.get("/evidences", summary="证据列表")
def list_evidences(session: Session = Depends(get_session)):
    rows = session.exec(select(Evidence)).all()
    return {"count": len(rows), "items": sorted(rows, key=lambda e: e.id)}


@router.get("/evidence/{evidence_id}", summary="证据详情")
def get_evidence(evidence_id: str, session: Session = Depends(get_session)):
    row = session.get(Evidence, evidence_id)
    if not row:
        raise HTTPException(status_code=404, detail=f"未找到证据: {evidence_id}")
    return {"item": row}
