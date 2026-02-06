"""用户数据模型"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """用户模型"""
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    nickname = Column(String(100), nullable=True)
    avatar = Column(String(500), nullable=True)
    role = Column(
        Enum("admin", "user", name="user_role"),
        default="user",
        nullable=False,
    )
    is_active = Column(Boolean, default=True, nullable=False)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # 关系
    projects = relationship("Project", back_populates="owner")
