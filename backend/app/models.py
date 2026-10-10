"""SQLModel 数据模型定义。

所有可展示实体均包含 url / url_title 字段，用于承载权威科普链接。
"""
from __future__ import annotations

from typing import Optional

from sqlmodel import Field, SQLModel


class Term(SQLModel, table=True):
    """节气。"""

    __tablename__ = "terms"

    id: str = Field(primary_key=True)
    name: str = Field(index=True)
    huangjing: int = Field(description="太阳黄经，单位度")
    date: str = Field(description="公历日期范围")
    season: str = Field(index=True)
    phenology: str = Field(description="物候")
    climate: str = Field(description="气候特征")
    proverb: Optional[str] = Field(default=None, description="农谚（民间流传，弱证据）")
    url: str = Field(description="权威科普链接")
    url_title: str = Field(description="科普链接标题")


class Tech(SQLModel, table=True):
    """生物技术。"""

    __tablename__ = "techs"

    id: str = Field(primary_key=True)
    name: str = Field(index=True)
    category: str
    description: str
    scenarios: str = Field(description="适用场景")
    url: str
    url_title: str


class Organism(SQLModel, table=True):
    """作物 / 畜禽 / 水产 / 微生物等生物对象。"""

    __tablename__ = "organisms"

    id: str = Field(primary_key=True)
    name: str = Field(index=True)
    type: str = Field(description="作物/畜禽/水产/微生物")
    url: str
    url_title: str


class Gene(SQLModel, table=True):
    """基因。"""

    __tablename__ = "genes"

    id: str = Field(primary_key=True)
    name: str = Field(index=True)
    function: str
    organism: str = Field(description="关联生物")
    url: str
    url_title: str


class Environment(SQLModel, table=True):
    """环境因子。"""

    __tablename__ = "environments"

    id: str = Field(primary_key=True)
    name: str = Field(index=True)
    unit: str
    effect: str = Field(description="影响")
    url: str
    url_title: str


class Region(SQLModel, table=True):
    """地区。"""

    __tablename__ = "regions"

    id: str = Field(primary_key=True)
    name: str = Field(index=True)
    climate_zone: str
    crops: str = Field(description="典型作物")
    url: str
    url_title: str


class Relation(SQLModel, table=True):
    """实体之间的关系（解释 / 指导 / 突破 / 适应 / 案例）。"""

    __tablename__ = "relations"

    id: Optional[int] = Field(default=None, primary_key=True)
    source_id: str = Field(index=True)
    target_id: str = Field(index=True)
    type: str = Field(index=True, description="解释/指导/突破/适应/案例")
    description: str
    nature: str = Field(description="传统经验 / 现代科学机制")
    evidence_level: str = Field(description="强/中/弱/待验证")
    source_type: str = Field(description="古籍/农谚/论文/标准/专家意见/示例")
    source_ref: str
    region: Optional[str] = None
    season: Optional[str] = None
    confidence: float = 0.5


class Evidence(SQLModel, table=True):
    """证据。"""

    __tablename__ = "evidences"

    id: str = Field(primary_key=True)
    title: str
    source_type: str
    citation: str
    level: str
    note: Optional[str] = None
