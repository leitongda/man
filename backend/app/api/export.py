"""导出API"""

from typing import Literal
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db

router = APIRouter()


class ExportRequest(BaseModel):
    format: Literal["png", "jpg", "pdf", "psd"]


@router.post("/{project_id}/chapters/{chapter_id}/export")
async def export_chapter(
    project_id: str,
    chapter_id: str,
    request: ExportRequest,
    db: Session = Depends(get_db)
):
    """导出章节"""
    # TODO: 实现章节导出
    raise HTTPException(status_code=501, detail="Export not implemented yet")


@router.post("/{project_id}/export")
async def export_project(
    project_id: str,
    request: ExportRequest,
    db: Session = Depends(get_db)
):
    """导出整个项目"""
    # TODO: 实现项目导出
    raise HTTPException(status_code=501, detail="Export not implemented yet")
