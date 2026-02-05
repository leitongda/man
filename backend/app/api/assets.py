"""资产管理API"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.asset import AssetResponse

router = APIRouter()


@router.get("/{project_id}/assets", response_model=List[AssetResponse])
async def list_assets(
    project_id: str,
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取资产列表"""
    # TODO: 实现获取资产列表
    return []


@router.post("/{project_id}/assets/upload", response_model=AssetResponse)
async def upload_asset(
    project_id: str,
    file: UploadFile = File(...),
    type: str = Form(...),
    db: Session = Depends(get_db)
):
    """上传资产"""
    # TODO: 实现文件上传
    return {
        "id": "asset-123",
        "project_id": project_id,
        "type": type,
        "filename": file.filename,
        "path": f"/assets/{file.filename}",
        "created_at": "2024-01-01T00:00:00Z",
    }


@router.delete("/{project_id}/assets/{asset_id}")
async def delete_asset(
    project_id: str,
    asset_id: str,
    db: Session = Depends(get_db)
):
    """删除资产"""
    # TODO: 实现删除资产
    return {"status": "deleted"}
