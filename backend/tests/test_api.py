"""后端 API 与种子数据测试。"""
from __future__ import annotations

from urllib.parse import urlparse

from app.seed import allowed_domains, check_url, load_seed_data, validate

SEED = load_seed_data()
DOMAINS = allowed_domains(SEED)

ENTITY_ENDPOINTS = [
    "/api/terms", "/api/techs", "/api/organisms", "/api/genes",
    "/api/environments", "/api/regions", "/api/meta",
]

DETAIL_ENDPOINTS = [
    ("/api/terms/lichun", "url"),
    ("/api/techs/gene_editing", "url_title"),
    ("/api/organisms/rice", "url"),
    ("/api/genes/vrn1", "url_title"),
    ("/api/environments/temperature", "url"),
    ("/api/regions/north_china", "url"),
]


def test_seed_has_no_validation_problems():
    report = validate(SEED)
    assert report["problems"] == [], report["problems"]


def test_seed_minimum_counts():
    counts = validate(SEED)["counts"]
    assert counts["terms"] >= 24
    assert counts["techs"] >= 12
    assert counts["organisms"] >= 10
    assert counts["genes"] >= 5
    assert counts["environments"] >= 5
    assert counts["regions"] >= 5
    assert counts["relations"] >= 20
    assert counts["evidences"] >= 5


def test_all_seed_urls_are_authoritative():
    for key in ("terms", "techs", "organisms", "genes", "environments", "regions"):
        for item in SEED[key]:
            assert check_url(item["url"], DOMAINS), f"{key}:{item['id']} -> {item['url']}"


def test_urls_use_https_or_http_scheme():
    for key in ("terms", "techs", "organisms", "genes", "environments", "regions"):
        for item in SEED[key]:
            assert urlparse(item["url"]).scheme in {"http", "https"}


def test_relations_have_source_and_evidence_fields():
    for rel in SEED["relations"]:
        assert rel["source_type"] in {"古籍", "农谚", "论文", "标准", "专家意见", "示例"}
        assert rel["evidence_level"] in {"强", "中", "弱", "待验证"}
        assert rel["source_ref"]
        assert rel["type"] in {"解释", "指导", "突破", "适应", "案例"}
        assert rel["nature"] in {"传统经验", "现代科学机制"}


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_seed_report_no_problems(client):
    r = client.get("/api/seed-report")
    assert r.status_code == 200
    assert r.json()["problems"] == []


def test_list_endpoints(client):
    for ep in ENTITY_ENDPOINTS:
        r = client.get(ep)
        assert r.status_code == 200, ep
        assert "count" in r.json() or ep.endswith("/meta")


def test_terms_sorted_and_complete(client):
    data = client.get("/api/terms").json()
    assert data["count"] == 24
    hj = [t["huangjing"] for t in data["items"]]
    assert hj == sorted(hj)


def test_detail_endpoints_expose_links(client):
    for ep, field in DETAIL_ENDPOINTS:
        body = client.get(ep).json()
        item = body["item"]
        assert item["url"].startswith("http")
        assert item["url_title"]
        assert field in item
        assert isinstance(body["relations"], list)


def test_detail_404(client):
    assert client.get("/api/terms/not-exist").status_code == 404
    assert client.get("/api/techs/not-exist").status_code == 404


def test_graph_has_nodes_and_links(client):
    data = client.get("/api/graph").json()
    assert data["stats"]["node_count"] > 0
    assert data["stats"]["link_count"] > 0
    assert {"nodes", "links"} <= set(data)


def test_graph_filter_by_term(client):
    data = client.get("/api/graph", params={"term": "qiufen"}).json()
    assert data["stats"]["link_count"] >= 1
    ids = {n["id"] for n in data["nodes"]}
    assert "qiufen" in ids
    for link in data["links"]:
        assert "qiufen" in (link["source"], link["target"])


def test_graph_filter_missing_term_returns_empty(client):
    data = client.get("/api/graph", params={"term": "__none__"}).json()
    assert data["stats"]["link_count"] == 0


def test_search(client):
    data = client.get("/api/search", params={"q": "小麦"}).json()
    assert data["count"] >= 1
    for item in data["results"]:
        assert item["url"].startswith("http")
        assert item["url_title"]


def test_search_empty_query(client):
    data = client.get("/api/search", params={"q": ""}).json()
    assert data["count"] == 0


def test_advice_contains_disclaimer(client):
    data = client.get("/api/advice", params={"region": "north_china", "crop": "winter_wheat", "term": "qiufen"}).json()
    assert "仅供参考" in data["disclaimer"]
    assert data["query"]["region"] == "华北"
    assert data["query"]["crop"] == "冬小麦"
    assert data["query"]["term"] == "秋分"
    assert len(data["suggestions"]) >= 1
    for s in data["suggestions"]:
        assert s["evidence_level"] in {"强", "中", "弱", "待验证"}


def test_advice_separates_traditional_and_modern(client):
    data = client.get("/api/advice", params={"term": "qiufen", "crop": "winter_wheat"}).json()
    assert data["traditional_experience"]
    assert len(data["modern_mechanisms"]) >= 1


def test_climate(client):
    data = client.get("/api/climate", params={"delta": 2}).json()
    assert data["delta"] == 2
    assert len(data["terms"]) == 24
    assert "仅供参考" in data["disclaimer"]
    assert len(data["technologies"]) >= 1
    for t in data["terms"]:
        assert t["shift_days"] >= 0


def test_climate_delta_zero(client):
    data = client.get("/api/climate", params={"delta": 0}).json()
    assert all(t["shift_days"] == 0 for t in data["terms"])


def test_climate_rejects_out_of_range(client):
    assert client.get("/api/climate", params={"delta": 9}).status_code == 422


def test_evidence(client):
    data = client.get("/api/evidences").json()
    assert data["count"] >= 5
    first = data["items"][0]["id"]
    assert client.get(f"/api/evidence/{first}").status_code == 200
    assert client.get("/api/evidence/not-exist").status_code == 404


def test_docs_available(client):
    assert client.get("/docs").status_code == 200
    assert client.get("/openapi.json").status_code == 200
