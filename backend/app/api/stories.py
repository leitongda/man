"""故事扩写API"""

from typing import Literal
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.story import StoryOutlineResponse

router = APIRouter()


@router.get("/{project_id}/story/outline", response_model=StoryOutlineResponse)
async def get_story_outline(project_id: str, db: Session = Depends(get_db)):
    """获取故事大纲"""
    # TODO: 实现获取故事大纲
    raise HTTPException(status_code=404, detail="Story outline not found")


@router.post("/{project_id}/story/generate")
async def generate_story(
    project_id: str,
    length: Literal["short", "mid", "long"] = "short",
    db: Session = Depends(get_db)
):
    """AI生成故事"""
    # TODO: 调用AI服务生成故事
    return {"status": "generating", "task_id": "task-123", "length": length}
