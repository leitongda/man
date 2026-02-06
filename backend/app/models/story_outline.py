"""故事大纲数据模型"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class StoryOutline(Base):
    """故事大纲模型 - 持久化项目的大纲/故事线"""
    __tablename__ = "story_outlines"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, unique=True)
    synopsis_short = Column(Text, nullable=True)
    synopsis_mid = Column(Text, nullable=True)
    synopsis_long = Column(Text, nullable=True)
    key_beats = Column(JSON, default=list)
    storylines = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    project = relationship("Project", back_populates="story_outline")
