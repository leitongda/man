"""章节API"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.chapter import ChapterResponse

router = APIRouter()


@router.get("/{project_id}/chapters", response_model=List[ChapterResponse])
async def list_chapters(project_id: str, db: Session = Depends(get_db)):
    """获取章节列表"""
    # TODO: 实现获取章节列表
    return []


@router.get("/{project_id}/chapters/{chapter_id}", response_model=ChapterResponse)
async def get_chapter(
    project_id: str, 
    chapter_id: str, 
    db: Session = Depends(get_db)
):
    """获取章节详情"""
    # TODO: 实现获取章节详情
    raise HTTPException(status_code=404, detail="Chapter not found")


@router.post("/{project_id}/chapters/generate")
async def generate_chapters(project_id: str, db: Session = Depends(get_db)):
    """AI生成章节规划"""
    # TODO: 调用AI服务生成章节
    return {"status": "generating", "task_id": "task-123"}
