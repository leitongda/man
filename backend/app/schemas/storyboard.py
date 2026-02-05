"""分镜相关Schema"""

from typing import List, Optional, Literal
from pydantic import BaseModel


class Dialogue(BaseModel):
    """对话"""
    character_id: str
    text: str
    type: Literal["speech", "thought", "narration", "os"]


class Panel(BaseModel):
    """分镜"""
    id: str
    scene_id: str
    order: int
    location: str
    time: str
    characters: List[str] = []
    camera: Literal["wide", "medium", "close_up", "extreme_close_up", "bird_eye", "worm_eye"]
    action: str
    expression: str
    dialogue: List[Dialogue] = []
    sfx: List[str] = []
    composition: str
    continuity_notes: str
    rough_image: Optional[str] = None
    final_image: Optional[str] = None
    generation_prompt: Optional[str] = None
    status: Literal["pending", "rough", "final", "approved", "rejected"] = "pending"


class Scene(BaseModel):
    """场景"""
    id: str
    location: str
    time: str
    characters: List[str] = []
    purpose: str
    mood: str
    panels: List[Panel] = []


class StoryboardResponse(BaseModel):
    """分镜脚本响应"""
    scenes: List[Scene] = []


class PanelUpdate(BaseModel):
    """分镜更新请求"""
    location: Optional[str] = None
    time: Optional[str] = None
    characters: Optional[List[str]] = None
    camera: Optional[Literal["wide", "medium", "close_up", "extreme_close_up", "bird_eye", "worm_eye"]] = None
    action: Optional[str] = None
    expression: Optional[str] = None
    dialogue: Optional[List[Dialogue]] = None
    sfx: Optional[List[str]] = None
    composition: Optional[str] = None
    continuity_notes: Optional[str] = None
    status: Optional[Literal["pending", "rough", "final", "approved", "rejected"]] = None
