"""故事相关Schema"""

from typing import List, Optional, Literal
from pydantic import BaseModel


class Beat(BaseModel):
    """节拍"""
    id: str
    order: int
    type: Literal["setup", "conflict", "twist", "climax", "resolution"]
    description: str
    characters_involved: List[str] = []


class StoryOutlineResponse(BaseModel):
    """故事大纲响应"""
    synopsis_short: str = ""
    synopsis_mid: str = ""
    synopsis_long: Optional[str] = None
    key_beats: List[Beat] = []
    outline: List[Beat] = []
