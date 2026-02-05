"""Story Bible API"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.story_bible import StoryBibleResponse, StoryBibleUpdate

router = APIRouter()


@router.get("/{project_id}/story-bible", response_model=StoryBibleResponse)
async def get_story_bible(project_id: str, db: Session = Depends(get_db)):
    """获取项目的Story Bible"""
    # TODO: 实现获取Story Bible
    raise HTTPException(status_code=404, detail="Story Bible not found")


@router.post("/{project_id}/story-bible/generate")
async def generate_story_bible(project_id: str, db: Session = Depends(get_db)):
    """AI生成Story Bible"""
    # TODO: 调用AI服务生成Story Bible
    return {"status": "generating", "task_id": "task-123"}


@router.patch("/{project_id}/story-bible", response_model=StoryBibleResponse)
async def update_story_bible(
    project_id: str,
    story_bible: StoryBibleUpdate,
    db: Session = Depends(get_db)
):
    """更新Story Bible"""
    # TODO: 实现更新Story Bible
    raise HTTPException(status_code=404, detail="Story Bible not found")
