"""Story Bible API"""

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.story_bible import StoryBible, Character
from app.schemas.story_bible import StoryBibleResponse, StoryBibleUpdate

router = APIRouter()


def _get_project(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project


def _build_response(story_bible: StoryBible) -> StoryBibleResponse:
    """构建 StoryBible 响应"""
    characters = []
    for c in story_bible.characters:
        characters.append({
            "id": c.id,
            "name": c.name,
            "appearance": c.appearance or {},
            "personality": c.personality or "",
            "speech_pattern": c.speech_pattern or "",
            "motivation": c.motivation or "",
            "relationships": c.relationships or [],
            "reference_images": c.reference_images or [],
            "prompt_fragments": c.prompt_fragments or [],
        })
    return StoryBibleResponse(
        characters=characters,
        world=story_bible.world or {},
        style_guide=story_bible.style_guide or {},
        continuity_rules=story_bible.continuity_rules or [],
    )


@router.get("/{project_id}/story-bible", response_model=StoryBibleResponse)
async def get_story_bible(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取项目的Story Bible"""
    _get_project(project_id, current_user, db)
    story_bible = db.query(StoryBible).filter(StoryBible.project_id == project_id).first()
    if not story_bible:
        # 自动创建空的 StoryBible
        story_bible = StoryBible(project_id=project_id)
        db.add(story_bible)
        db.commit()
        db.refresh(story_bible)
    return _build_response(story_bible)


@router.patch("/{project_id}/story-bible", response_model=StoryBibleResponse)
async def update_story_bible(
    project_id: str,
    data: StoryBibleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新Story Bible"""
    _get_project(project_id, current_user, db)
    story_bible = db.query(StoryBible).filter(StoryBible.project_id == project_id).first()
    if not story_bible:
        story_bible = StoryBible(project_id=project_id)
        db.add(story_bible)
        db.flush()

    update_data = data.model_dump(exclude_unset=True)

    # 处理角色更新
    if "characters" in update_data and update_data["characters"] is not None:
        # 删除旧角色，重建
        db.query(Character).filter(Character.story_bible_id == story_bible.id).delete()
        for char_data in update_data["characters"]:
            char = Character(
                story_bible_id=story_bible.id,
                name=char_data.get("name", ""),
                appearance=char_data.get("appearance", {}),
                personality=char_data.get("personality", ""),
                speech_pattern=char_data.get("speech_pattern", ""),
                motivation=char_data.get("motivation", ""),
                relationships=char_data.get("relationships", []),
                reference_images=char_data.get("reference_images", []),
                prompt_fragments=char_data.get("prompt_fragments", []),
            )
            db.add(char)
        del update_data["characters"]

    # 处理其他字段
    for key, value in update_data.items():
        if value is not None:
            if hasattr(value, "model_dump"):
                setattr(story_bible, key, value.model_dump())
            else:
                setattr(story_bible, key, value)

    db.commit()
    db.refresh(story_bible)
    return _build_response(story_bible)


@router.post("/{project_id}/story-bible/generate")
async def generate_story_bible(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI生成Story Bible"""
    _get_project(project_id, current_user, db)
    # TODO: 调用AI服务生成Story Bible
    return {"status": "generating", "message": "AI世界观生成功能待实现"}
