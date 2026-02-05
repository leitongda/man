"""项目相关Schema"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel


class ProjectConfig(BaseModel):
    """项目配置"""
    style: Literal["manga", "manhua", "webtoon", "american", "realistic", "watercolor"] = "manga"
    format: Literal["webtoon_vertical", "a4_page", "custom"] = "webtoon_vertical"
    panels_per_chapter: int = 12
    max_characters: int = 5
    content_rating: Literal["all_ages", "teen", "mature"] = "all_ages"
    tone: Literal["comedy", "serious", "suspense", "romance", "action"] = "comedy"
    language: str = "zh-CN"


class ProjectCreate(BaseModel):
    """创建项目请求"""
    name: str
    description: Optional[str] = None
    config: ProjectConfig = ProjectConfig()


class ProjectUpdate(BaseModel):
    """更新项目请求"""
    name: Optional[str] = None
    description: Optional[str] = None
    config: Optional[ProjectConfig] = None
    status: Optional[Literal["draft", "in_progress", "completed"]] = None
    current_step: Optional[int] = None


class ProjectResponse(BaseModel):
    """项目响应"""
    id: str
    name: str
    description: Optional[str] = None
    config: ProjectConfig
    status: Literal["draft", "in_progress", "completed"]
    current_step: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
