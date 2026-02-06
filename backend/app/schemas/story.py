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


class Storyline(BaseModel):
    """故事线"""
    id: str
    name: str
    description: str
    beats: List[str] = []  # beat ids


class StoryOutlineResponse(BaseModel):
    """故事大纲响应"""
    id: str
    project_id: str
    synopsis_short: str = ""
    synopsis_mid: str = ""
    synopsis_long: Optional[str] = None
    key_beats: List[Beat] = []
    storylines: List[Storyline] = []

    class Config:
        from_attributes = True


class StoryOutlineUpdate(BaseModel):
    """故事大纲更新"""
    synopsis_short: Optional[str] = None
    synopsis_mid: Optional[str] = None
    synopsis_long: Optional[str] = None
    key_beats: Optional[List[Beat]] = None
    storylines: Optional[List[Storyline]] = None
