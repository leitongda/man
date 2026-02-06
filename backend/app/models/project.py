"""项目数据模型"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, DateTime, Integer, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Project(Base):
    """项目模型"""
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    config = Column(JSON, nullable=False, default=dict)
    status = Column(
        Enum("draft", "in_progress", "completed", name="project_status"),
        default="draft"
    )
    current_step = Column(Integer, default=0)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    owner = relationship("User", back_populates="projects")
    story_outline = relationship("StoryOutline", back_populates="project", uselist=False)
    story_bible = relationship("StoryBible", back_populates="project", uselist=False)
    chapters = relationship("Chapter", back_populates="project", order_by="Chapter.order")
    assets = relationship("Asset", back_populates="project")
