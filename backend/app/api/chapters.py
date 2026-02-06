"""章节API"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.chapter import Chapter
from app.schemas.chapter import ChapterCreate, ChapterUpdate, ChapterResponse

router = APIRouter()


def _get_project(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project


@router.get("/{project_id}/chapters", response_model=List[ChapterResponse])
async def list_chapters(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取章节列表"""
    _get_project(project_id, current_user, db)
    chapters = db.query(Chapter).filter(
        Chapter.project_id == project_id
    ).order_by(Chapter.order).all()
    return [ChapterResponse.model_validate(c) for c in chapters]


@router.get("/{project_id}/chapters/{chapter_id}", response_model=ChapterResponse)
async def get_chapter(
    project_id: str,
    chapter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取章节详情"""
    _get_project(project_id, current_user, db)
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id, Chapter.project_id == project_id
    ).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")
    return ChapterResponse.model_validate(chapter)


@router.post("/{project_id}/chapters", response_model=ChapterResponse, status_code=201)
async def create_chapter(
    project_id: str,
    data: ChapterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """创建章节"""
    _get_project(project_id, current_user, db)
    # 自动计算 order
    max_order = db.query(Chapter).filter(
        Chapter.project_id == project_id
    ).count()

    chapter = Chapter(
        project_id=project_id,
        order=max_order + 1,
        title=data.title,
        logline=data.logline,
        beats=data.beats,
        cliffhanger=data.cliffhanger,
        estimated_panels=data.estimated_panels,
    )
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    return ChapterResponse.model_validate(chapter)


@router.patch("/{project_id}/chapters/{chapter_id}", response_model=ChapterResponse)
async def update_chapter(
    project_id: str,
    chapter_id: str,
    data: ChapterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新章节"""
    _get_project(project_id, current_user, db)
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id, Chapter.project_id == project_id
    ).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(chapter, key, value)

    db.commit()
    db.refresh(chapter)
    return ChapterResponse.model_validate(chapter)


@router.delete("/{project_id}/chapters/{chapter_id}")
async def delete_chapter(
    project_id: str,
    chapter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """删除章节"""
    _get_project(project_id, current_user, db)
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id, Chapter.project_id == project_id
    ).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    db.delete(chapter)
    db.commit()
    return {"message": "章节已删除"}


@router.post("/{project_id}/chapters/generate")
async def generate_chapters(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI生成章节规划"""
    _get_project(project_id, current_user, db)
    # TODO: 调用AI服务生成章节
    return {"status": "generating", "message": "AI章节生成功能待实现"}
