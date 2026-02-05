"""分镜脚本API"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.storyboard import StoryboardResponse, PanelUpdate

router = APIRouter()


@router.get("/{project_id}/chapters/{chapter_id}/storyboard", response_model=StoryboardResponse)
async def get_storyboard(
    project_id: str,
    chapter_id: str,
    db: Session = Depends(get_db)
):
    """获取章节分镜脚本"""
    # TODO: 实现获取分镜脚本
    raise HTTPException(status_code=404, detail="Storyboard not found")


@router.post("/{project_id}/chapters/{chapter_id}/storyboard/generate")
async def generate_storyboard(
    project_id: str,
    chapter_id: str,
    db: Session = Depends(get_db)
):
    """AI生成分镜脚本"""
    # TODO: 调用AI服务生成分镜
    return {"status": "generating", "task_id": "task-123"}


@router.patch("/{project_id}/panels/{panel_id}")
async def update_panel(
    project_id: str,
    panel_id: str,
    panel: PanelUpdate,
    db: Session = Depends(get_db)
):
    """更新分镜"""
    # TODO: 实现更新分镜
    raise HTTPException(status_code=404, detail="Panel not found")
