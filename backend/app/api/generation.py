"""图像生成API"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter()


class BatchGenerateRequest(BaseModel):
    panel_ids: List[str]
    rough: bool = False


@router.post("/{project_id}/characters/{character_id}/generate-sheet")
async def generate_character_sheet(
    project_id: str,
    character_id: str,
    db: Session = Depends(get_db)
):
    """生成角色设定图"""
    # TODO: 调用AI服务生成角色设定图
    return {"status": "generating", "task_id": "task-123"}


@router.post("/{project_id}/panels/{panel_id}/generate")
async def generate_panel(
    project_id: str,
    panel_id: str,
    rough: bool = False,
    db: Session = Depends(get_db)
):
    """生成单个分镜图"""
    # TODO: 调用AI服务生成分镜图
    return {
        "status": "generating",
        "task_id": "task-123",
        "panel_id": panel_id,
        "rough": rough,
    }


@router.post("/{project_id}/panels/generate-batch")
async def generate_panels_batch(
    project_id: str,
    request: BatchGenerateRequest,
    db: Session = Depends(get_db)
):
    """批量生成分镜图"""
    # TODO: 调用AI服务批量生成分镜图
    return {
        "status": "generating",
        "task_id": "task-123",
        "panel_ids": request.panel_ids,
        "rough": request.rough,
    }
