"""Story Bible数据模型"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class StoryBible(Base):
    """Story Bible模型"""
    __tablename__ = "story_bibles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False, unique=True)
    world = Column(JSON, default=dict)
    style_guide = Column(JSON, default=dict)
    continuity_rules = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    project = relationship("Project", back_populates="story_bible")
    characters = relationship("Character", back_populates="story_bible")


class Character(Base):
    """角色模型"""
    __tablename__ = "characters"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    story_bible_id = Column(String(36), ForeignKey("story_bibles.id"), nullable=False)
    name = Column(String(255), nullable=False)
    appearance = Column(JSON, default=dict)
    personality = Column(Text, nullable=True)
    speech_pattern = Column(Text, nullable=True)
    motivation = Column(Text, nullable=True)
    relationships = Column(JSON, default=list)
    reference_images = Column(JSON, default=list)
    prompt_fragments = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    story_bible = relationship("StoryBible", back_populates="characters")
