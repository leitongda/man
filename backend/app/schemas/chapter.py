"""章节相关Schema"""

from typing import List, Optional
from pydantic import BaseModel


class ChapterResponse(BaseModel):
    """章节响应"""
    id: str
    order: int
    title: str
    logline: str
    beats: List[str] = []
    cliffhanger: Optional[str] = None
    estimated_panels: int
