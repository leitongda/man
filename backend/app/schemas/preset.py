"""预设相关Schema"""

from datetime import datetime
from typing import Optional, Literal, Any
from pydantic import BaseModel, Field


class PresetCreate(BaseModel):
    """创建预设"""
    type: Literal["character", "world", "style", "scene", "storyboard"]
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    data: dict = {}
    is_public: bool = False


class PresetUpdate(BaseModel):
    """更新预设"""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    data: Optional[dict] = None
    is_public: Optional[bool] = None


class PresetResponse(BaseModel):
    """预设响应"""
    id: str
    owner_id: Optional[str] = None
    type: str
    name: str
    description: Optional[str] = None
    data: dict
    is_public: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PresetListResponse(BaseModel):
    """预设列表响应"""
    items: list[PresetResponse]
    total: int
