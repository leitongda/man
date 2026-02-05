"""项目管理API"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter()


@router.get("", response_model=List[ProjectResponse])
async def list_projects(db: Session = Depends(get_db)):
    """获取项目列表"""
    # TODO: 实现数据库查询
    return []


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, db: Session = Depends(get_db)):
    """获取项目详情"""
    # TODO: 实现数据库查询
    raise HTTPException(status_code=404, detail="Project not found")


@router.post("", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db: Session = Depends(get_db)):
    """创建项目"""
    # TODO: 实现数据库插入
    return {
        "id": "test-id",
        "name": project.name,
        "description": project.description,
        "config": project.config.model_dump(),
        "status": "draft",
        "current_step": 0,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z",
    }


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str, 
    project: ProjectUpdate, 
    db: Session = Depends(get_db)
):
    """更新项目"""
    # TODO: 实现数据库更新
    raise HTTPException(status_code=404, detail="Project not found")


@router.delete("/{project_id}")
async def delete_project(project_id: str, db: Session = Depends(get_db)):
    """删除项目"""
    # TODO: 实现数据库删除
    return {"status": "deleted"}
