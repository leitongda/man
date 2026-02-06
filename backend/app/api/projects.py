"""项目管理API"""

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter()


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    status: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取当前用户的项目列表"""
    query = db.query(Project).filter(Project.owner_id == current_user.id)
    
    if status:
        query = query.filter(Project.status == status)
    
    projects = query.order_by(Project.updated_at.desc()).all()
    return [ProjectResponse.model_validate(p) for p in projects]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取项目详情"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    return ProjectResponse.model_validate(project)


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """创建项目"""
    project = Project(
        name=data.name,
        description=data.description,
        config=data.config.model_dump(),
        status="draft",
        current_step=0,
        owner_id=current_user.id,
    )
    
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return ProjectResponse.model_validate(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新项目"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    update_data = data.model_dump(exclude_unset=True)
    
    # 处理 config 嵌套更新
    if "config" in update_data and update_data["config"] is not None:
        update_data["config"] = update_data["config"].model_dump() if hasattr(update_data["config"], "model_dump") else update_data["config"]
    
    for key, value in update_data.items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    
    return ProjectResponse.model_validate(project)


@router.delete("/{project_id}")
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """删除项目"""
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
    ).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    
    db.delete(project)
    db.commit()
    
    return {"message": "项目已删除"}
