"""Pydantic模式定义"""

from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectConfig
from app.schemas.story_bible import StoryBibleResponse, StoryBibleUpdate
from app.schemas.story import StoryOutlineResponse
from app.schemas.chapter import ChapterResponse
from app.schemas.storyboard import StoryboardResponse, PanelUpdate
from app.schemas.asset import AssetResponse
from app.schemas.ai_model import (
    AIModelCreate,
    AIModelUpdate,
    AIModelResponse,
    AIModelListResponse,
    AIModelTestResult,
    DefaultModelsResponse,
)

__all__ = [
    "ProjectCreate",
    "ProjectUpdate", 
    "ProjectResponse",
    "ProjectConfig",
    "StoryBibleResponse",
    "StoryBibleUpdate",
    "StoryOutlineResponse",
    "ChapterResponse",
    "StoryboardResponse",
    "PanelUpdate",
    "AssetResponse",
    "AIModelCreate",
    "AIModelUpdate",
    "AIModelResponse",
    "AIModelListResponse",
    "AIModelTestResult",
    "DefaultModelsResponse",
]
