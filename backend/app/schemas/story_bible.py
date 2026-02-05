"""Story Bible相关Schema"""

from typing import List, Optional
from pydantic import BaseModel


class CharacterAppearance(BaseModel):
    """角色外观"""
    face: str = ""
    hair: str = ""
    body: str = ""
    clothing: List[str] = []
    accessories: List[str] = []


class CharacterRelationship(BaseModel):
    """角色关系"""
    character_id: str
    relation: str


class Character(BaseModel):
    """角色"""
    id: str
    name: str
    appearance: CharacterAppearance
    personality: str = ""
    speech_pattern: str = ""
    motivation: str = ""
    relationships: List[CharacterRelationship] = []
    reference_images: List[str] = []
    prompt_fragments: List[str] = []


class WorldSetting(BaseModel):
    """世界观设定"""
    era: str = ""
    location: str = ""
    rules: List[str] = []
    technology_level: str = ""
    social_structure: str = ""


class StyleGuide(BaseModel):
    """风格指南"""
    art_style: str = ""
    line_style: str = ""
    coloring: str = ""
    texture: str = ""
    camera_preferences: List[str] = []


class ContinuityRule(BaseModel):
    """一致性规则"""
    subject: str
    rule: str
    reference_image: Optional[str] = None


class StoryBibleResponse(BaseModel):
    """Story Bible响应"""
    characters: List[Character] = []
    world: WorldSetting = WorldSetting()
    style_guide: StyleGuide = StyleGuide()
    continuity_rules: List[ContinuityRule] = []


class StoryBibleUpdate(BaseModel):
    """Story Bible更新请求"""
    characters: Optional[List[Character]] = None
    world: Optional[WorldSetting] = None
    style_guide: Optional[StyleGuide] = None
    continuity_rules: Optional[List[ContinuityRule]] = None
