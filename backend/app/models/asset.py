"""资产数据模型"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Asset(Base):
    """资产模型"""
    __tablename__ = "assets"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id"), nullable=False)
    type = Column(String(50), nullable=False)  # character, environment, panel, page
    filename = Column(String(255), nullable=False)
    path = Column(String(500), nullable=False)
    metadata = Column(String, nullable=True)  # JSON字符串
    created_at = Column(DateTime, default=datetime.utcnow)

    # 关系
    project = relationship("Project", back_populates="assets")
