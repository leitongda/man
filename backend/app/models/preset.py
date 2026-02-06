"""预设数据模型"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, DateTime, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Preset(Base):
    """预设模型 - 全局可复用的角色/世界观/风格/场景/分镜模板"""
    __tablename__ = "presets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    type = Column(
        Enum("character", "world", "style", "scene", "storyboard", name="preset_type"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    data = Column(JSON, nullable=False, default=dict)
    is_public = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    owner = relationship("User", backref="presets")
