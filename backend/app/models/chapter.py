"""章节和分镜数据模型"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, DateTime, Integer, ForeignKey, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class Chapter(Base):
    """章节模型"""
    __tablename__ = "chapters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    logline = Column(Text, nullable=True)
    beats = Column(JSON, default=list)
    cliffhanger = Column(Text, nullable=True)
    estimated_panels = Column(Integer, default=12)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    project = relationship("Project", back_populates="chapters")
    scenes = relationship("Scene", back_populates="chapter")


class Scene(Base):
    """场景模型"""
    __tablename__ = "scenes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chapter_id = Column(String(36), ForeignKey("chapters.id"), nullable=False)
    order = Column(Integer, nullable=False)
    location = Column(String(255), nullable=True)
    time = Column(String(255), nullable=True)
    characters = Column(JSON, default=list)
    purpose = Column(Text, nullable=True)
    mood = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    chapter = relationship("Chapter", back_populates="scenes")
    panels = relationship("Panel", back_populates="scene")


class Panel(Base):
    """分镜模型"""
    __tablename__ = "panels"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    order = Column(Integer, nullable=False)
    location = Column(String(255), nullable=True)
    time = Column(String(255), nullable=True)
    characters = Column(JSON, default=list)
    camera = Column(String(50), default="medium")
    action = Column(Text, nullable=True)
    expression = Column(Text, nullable=True)
    dialogue = Column(JSON, default=list)
    sfx = Column(JSON, default=list)
    composition = Column(Text, nullable=True)
    continuity_notes = Column(Text, nullable=True)
    rough_image = Column(String(500), nullable=True)
    final_image = Column(String(500), nullable=True)
    generation_prompt = Column(Text, nullable=True)
    status = Column(
        Enum("pending", "rough", "final", "approved", "rejected", name="panel_status"),
        default="pending"
    )
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    scene = relationship("Scene", back_populates="panels")
