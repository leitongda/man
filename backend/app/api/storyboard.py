"""分镜脚本API"""

from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.chapter import Chapter, Scene, Panel
from app.schemas.storyboard import StoryboardResponse, PanelUpdate, Scene as SceneSchema, Panel as PanelSchema

router = APIRouter()


def _get_project(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(
        Project.id == project_id, Project.owner_id == user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project


@router.get("/{project_id}/chapters/{chapter_id}/storyboard", response_model=StoryboardResponse)
async def get_storyboard(
    project_id: str,
    chapter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取章节分镜脚本"""
    _get_project(project_id, current_user, db)
    chapter = db.query(Chapter).filter(
        Chapter.id == chapter_id, Chapter.project_id == project_id
    ).first()
    if not chapter:
        raise HTTPException(status_code=404, detail="章节不存在")

    scenes = db.query(Scene).filter(Scene.chapter_id == chapter_id).order_by(Scene.order).all()
    scene_list = []
    for scene in scenes:
        panels = db.query(Panel).filter(Panel.scene_id == scene.id).order_by(Panel.order).all()
        panel_list = [PanelSchema(
            id=p.id,
            scene_id=p.scene_id,
            order=p.order,
            location=p.location or "",
            time=p.time or "",
            characters=p.characters or [],
            camera=p.camera or "medium",
            action=p.action or "",
            expression=p.expression or "",
            dialogue=p.dialogue or [],
            sfx=p.sfx or [],
            composition=p.composition or "",
            continuity_notes=p.continuity_notes or "",
            rough_image=p.rough_image,
            final_image=p.final_image,
            generation_prompt=p.generation_prompt,
            status=p.status or "pending",
        ) for p in panels]

        scene_list.append(SceneSchema(
            id=scene.id,
            location=scene.location or "",
            time=scene.time or "",
            characters=scene.characters or [],
            purpose=scene.purpose or "",
            mood=scene.mood or "",
            panels=panel_list,
        ))

    return StoryboardResponse(scenes=scene_list)


@router.get("/{project_id}/panels", response_model=List[dict])
async def list_project_panels(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """获取项目所有分镜（含图片信息）"""
    _get_project(project_id, current_user, db)
    chapters = db.query(Chapter).filter(Chapter.project_id == project_id).order_by(Chapter.order).all()
    result = []
    for chapter in chapters:
        scenes = db.query(Scene).filter(Scene.chapter_id == chapter.id).order_by(Scene.order).all()
        for scene in scenes:
            panels = db.query(Panel).filter(Panel.scene_id == scene.id).order_by(Panel.order).all()
            for panel in panels:
                result.append({
                    "id": panel.id,
                    "chapter_id": chapter.id,
                    "chapter_title": chapter.title,
                    "chapter_order": chapter.order,
                    "scene_id": scene.id,
                    "order": panel.order,
                    "action": panel.action,
                    "dialogue": panel.dialogue,
                    "rough_image": panel.rough_image,
                    "final_image": panel.final_image,
                    "status": panel.status,
                    "generation_prompt": panel.generation_prompt,
                })
    return result


@router.patch("/{project_id}/panels/{panel_id}")
async def update_panel(
    project_id: str,
    panel_id: str,
    data: PanelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """更新分镜"""
    _get_project(project_id, current_user, db)
    panel = db.query(Panel).filter(Panel.id == panel_id).first()
    if not panel:
        raise HTTPException(status_code=404, detail="分镜不存在")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(panel, key, value)

    db.commit()
    db.refresh(panel)
    return {"message": "分镜已更新", "id": panel.id}


@router.post("/{project_id}/chapters/{chapter_id}/storyboard/generate")
async def generate_storyboard(
    project_id: str,
    chapter_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """AI生成分镜脚本"""
    _get_project(project_id, current_user, db)
    # TODO: 调用AI服务生成分镜
    return {"status": "generating", "message": "AI分镜生成功能待实现"}
