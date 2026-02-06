"""故事大纲API"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.story_outline import StoryOutline
from app.schemas.story import StoryOutlineResponse, StoryOutlineUpdate

router = APIRouter()


def _get_project(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project


@router.get("/{project_id}/story/outline", response_model=StoryOutlineResponse)
async def get_story_outline(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取故事大纲"""
    _get_project(project_id, current_user, db)
    outline = db.query(StoryOutline).filter(StoryOutline.project_id == project_id).first()
    if not outline:
        # 自动创建空大纲
        outline = StoryOutline(project_id=project_id)
        db.add(outline)
        db.commit()
        db.refresh(outline)
    return StoryOutlineResponse.model_validate(outline)


@router.patch("/{project_id}/story/outline", response_model=StoryOutlineResponse)
async def update_story_outline(
    project_id: str,
    data: StoryOutlineUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新故事大纲"""
    _get_project(project_id, current_user, db)
    outline = db.query(StoryOutline).filter(StoryOutline.project_id == project_id).first()
    if not outline:
        outline = StoryOutline(project_id=project_id)
        db.add(outline)
        db.flush()

    update_data = data.model_dump(exclude_unset=True)
    # JSON 字段需要序列化
    for key, value in update_data.items():
        if key in ("key_beats", "storylines") and value is not None:
            setattr(outline, key, [b.model_dump() if hasattr(b, 'model_dump') else b for b in value])
        else:
            setattr(outline, key, value)

    db.commit()
    db.refresh(outline)
    return StoryOutlineResponse.model_validate(outline)


@router.post("/{project_id}/story/generate")
async def generate_story(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI生成故事大纲"""
    _get_project(project_id, current_user, db)
    # TODO: 调用AI服务生成故事
    return {"status": "generating", "message": "AI故事生成功能待实现"}
