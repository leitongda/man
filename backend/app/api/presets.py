"""预设管理API"""

from typing import Optional, Literal
from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.preset import Preset
from app.models.project import Project
from app.models.story_bible import StoryBible, Character
from app.schemas.preset import PresetCreate, PresetUpdate, PresetResponse, PresetListResponse

router = APIRouter()


@router.get("", response_model=PresetListResponse)
async def list_presets(
    type: Optional[str] = Query(None, description="预设类型"),
    scope: Literal["private", "public", "all"] = Query("all"),
    keyword: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取预设列表"""
    query = db.query(Preset)

    # 范围过滤
    if scope == "private":
        query = query.filter(Preset.owner_id == current_user.id)
    elif scope == "public":
        query = query.filter(Preset.is_public == True)
    else:
        # all: 自己的 + 公共的
        query = query.filter(
            or_(Preset.owner_id == current_user.id, Preset.is_public == True)
        )

    if type:
        query = query.filter(Preset.type == type)

    if keyword:
        query = query.filter(
            or_(
                Preset.name.ilike(f"%{keyword}%"),
                Preset.description.ilike(f"%{keyword}%"),
            )
        )

    total = query.count()
    presets = query.order_by(Preset.updated_at.desc()).all()

    return PresetListResponse(
        items=[PresetResponse.model_validate(p) for p in presets],
        total=total,
    )


@router.get("/{preset_id}", response_model=PresetResponse)
async def get_preset(
    preset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取预设详情"""
    preset = db.query(Preset).filter(Preset.id == preset_id).first()
    if not preset:
        raise HTTPException(status_code=404, detail="预设不存在")

    # 权限检查：自己的或公共的
    if preset.owner_id != current_user.id and not preset.is_public:
        raise HTTPException(status_code=403, detail="无权访问此预设")

    return PresetResponse.model_validate(preset)


@router.post("", response_model=PresetResponse, status_code=201)
async def create_preset(
    data: PresetCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """创建预设"""
    preset = Preset(
        owner_id=current_user.id,
        type=data.type,
        name=data.name,
        description=data.description,
        data=data.data,
        is_public=data.is_public,
    )
    db.add(preset)
    db.commit()
    db.refresh(preset)
    return PresetResponse.model_validate(preset)


@router.patch("/{preset_id}", response_model=PresetResponse)
async def update_preset(
    preset_id: str,
    data: PresetUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新预设"""
    preset = db.query(Preset).filter(
        Preset.id == preset_id,
        Preset.owner_id == current_user.id,
    ).first()
    if not preset:
        raise HTTPException(status_code=404, detail="预设不存在或无权修改")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(preset, key, value)

    db.commit()
    db.refresh(preset)
    return PresetResponse.model_validate(preset)


@router.delete("/{preset_id}")
async def delete_preset(
    preset_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """删除预设"""
    preset = db.query(Preset).filter(
        Preset.id == preset_id,
        Preset.owner_id == current_user.id,
    ).first()
    if not preset:
        raise HTTPException(status_code=404, detail="预设不存在或无权删除")

    db.delete(preset)
    db.commit()
    return {"message": "预设已删除"}


@router.post("/{preset_id}/import-to-project/{project_id}")
async def import_preset_to_project(
    preset_id: str,
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """将预设数据导入到项目"""
    # 检查项目
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id,
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    # 检查预设
    preset = db.query(Preset).filter(Preset.id == preset_id).first()
    if not preset:
        raise HTTPException(status_code=404, detail="预设不存在")
    if preset.owner_id != current_user.id and not preset.is_public:
        raise HTTPException(status_code=403, detail="无权访问此预设")

    # 根据预设类型导入数据
    if preset.type == "character":
        # 导入角色到 StoryBible
        story_bible = db.query(StoryBible).filter(StoryBible.project_id == project_id).first()
        if not story_bible:
            story_bible = StoryBible(project_id=project_id)
            db.add(story_bible)
            db.flush()
        char = Character(
            story_bible_id=story_bible.id,
            name=preset.data.get("name", preset.name),
            appearance=preset.data.get("appearance", {}),
            personality=preset.data.get("personality", ""),
            speech_pattern=preset.data.get("speech_pattern", ""),
            motivation=preset.data.get("motivation", ""),
            relationships=preset.data.get("relationships", []),
            reference_images=preset.data.get("reference_images", []),
            prompt_fragments=preset.data.get("prompt_fragments", []),
        )
        db.add(char)

    elif preset.type == "world":
        story_bible = db.query(StoryBible).filter(StoryBible.project_id == project_id).first()
        if not story_bible:
            story_bible = StoryBible(project_id=project_id)
            db.add(story_bible)
        story_bible.world = preset.data

    elif preset.type == "style":
        story_bible = db.query(StoryBible).filter(StoryBible.project_id == project_id).first()
        if not story_bible:
            story_bible = StoryBible(project_id=project_id)
            db.add(story_bible)
        story_bible.style_guide = preset.data

    elif preset.type in ("scene", "storyboard"):
        # 场景/分镜预设存储为项目的通用数据
        pass

    db.commit()
    return {"message": f"预设 '{preset.name}' 已导入项目"}
