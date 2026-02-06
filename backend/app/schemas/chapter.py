"""章节相关Schema"""

from typing import List, Optional
from pydantic import BaseModel


class ChapterCreate(BaseModel):
    """创建章节"""
    title: str
    logline: Optional[str] = None
    beats: List[str] = []
    cliffhanger: Optional[str] = None
    estimated_panels: int = 12


class ChapterUpdate(BaseModel):
    """更新章节"""
    title: Optional[str] = None
    logline: Optional[str] = None
    beats: Optional[List[str]] = None
    cliffhanger: Optional[str] = None
    estimated_panels: Optional[int] = None


class ChapterResponse(BaseModel):
    """章节响应"""
    id: str
    project_id: str
    order: int
    title: str
    logline: Optional[str] = None
    beats: List[str] = []
    cliffhanger: Optional[str] = None
    estimated_panels: int

    class Config:
        from_attributes = True
