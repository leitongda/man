"""Step 6: 分镜出图"""

from typing import List, Optional
from celery import shared_task

from app.services.ai.sd_adapter import SDAdapter
from app.services.ai.comfyui_adapter import ComfyUIAdapter


PANEL_PROMPT_TEMPLATE = """{style_keywords},
{scene_description},
{character_descriptions},
{action_description},
{camera_type} shot,
{composition},
{mood},
masterpiece, best quality"""

ROUGH_NEGATIVE_PROMPT = "color, shading, detailed background"
FINAL_NEGATIVE_PROMPT = "low quality, blurry, bad anatomy, extra limbs, watermark, text, signature"


class ImageGenService:
    """分镜出图服务"""
    
    def __init__(self, use_comfyui: bool = False):
        if use_comfyui:
            self.image_ai = ComfyUIAdapter()
        else:
            self.image_ai = SDAdapter()
    
    def build_panel_prompt(
        self,
        panel: dict,
        characters: List[dict],
        style_guide: dict,
    ) -> str:
        """构建分镜提示词"""
        # 风格关键词
        style_keywords = f"{style_guide.get('art_style', 'manga')}, "
        style_keywords += f"{style_guide.get('line_style', 'clean lines')}, "
        style_keywords += f"{style_guide.get('coloring', 'flat colors')}"
        
        # 场景描述
        scene_desc = f"{panel.get('location', '')}, {panel.get('time', '')}"
        
        # 角色描述
        panel_characters = panel.get("characters", [])
        char_descs = []
        for char_id in panel_characters:
            char = next((c for c in characters if c.get("id") == char_id), None)
            if char:
                appearance = char.get("appearance", {})
                char_desc = f"{char.get('name')}, "
                char_desc += f"{appearance.get('hair', '')}, "
                char_desc += ", ".join(appearance.get("clothing", [])[:2])
                char_descs.append(char_desc)
        
        # 动作描述
        action_desc = f"{panel.get('action', '')}, {panel.get('expression', '')}"
        
        # 镜头类型映射
        camera_map = {
            "wide": "wide angle",
            "medium": "medium shot",
            "close_up": "close-up",
            "extreme_close_up": "extreme close-up",
            "bird_eye": "bird's eye view",
            "worm_eye": "worm's eye view",
        }
        camera_type = camera_map.get(panel.get("camera", "medium"), "medium shot")
        
        # 构图说明
        composition = panel.get("composition", "")
        
        # 情绪/氛围
        mood = panel.get("mood", "")
        
        prompt = PANEL_PROMPT_TEMPLATE.format(
            style_keywords=style_keywords,
            scene_description=scene_desc,
            character_descriptions=", ".join(char_descs),
            action_description=action_desc,
            camera_type=camera_type,
            composition=composition,
            mood=mood,
        )
        
        return prompt
    
    async def generate_rough(
        self,
        panel: dict,
        characters: List[dict],
        style_guide: dict,
    ) -> str:
        """生成草稿分镜（黑白线稿）"""
        base_prompt = self.build_panel_prompt(panel, characters, style_guide)
        prompt = f"monochrome, sketch, lineart, {base_prompt}"
        
        images = await self.image_ai.txt2img(
            prompt=prompt,
            negative_prompt=ROUGH_NEGATIVE_PROMPT,
            width=768,
            height=1024,  # 竖版
            steps=20,
            cfg_scale=7.0,
        )
        
        return images[0] if images else None
    
    async def generate_final(
        self,
        panel: dict,
        characters: List[dict],
        style_guide: dict,
        reference_images: Optional[List[str]] = None,
    ) -> str:
        """生成最终分镜（上色）"""
        prompt = self.build_panel_prompt(panel, characters, style_guide)
        
        # 如果有参考图，使用img2img
        if reference_images and len(reference_images) > 0:
            images = await self.image_ai.img2img(
                init_image=reference_images[0],
                prompt=prompt,
                negative_prompt=FINAL_NEGATIVE_PROMPT,
                strength=0.6,
                steps=30,
            )
        else:
            images = await self.image_ai.txt2img(
                prompt=prompt,
                negative_prompt=FINAL_NEGATIVE_PROMPT,
                width=768,
                height=1024,
                steps=30,
                cfg_scale=7.5,
            )
        
        return images[0] if images else None
    
    async def generate_batch(
        self,
        panels: List[dict],
        characters: List[dict],
        style_guide: dict,
        rough: bool = False,
    ) -> List[dict]:
        """批量生成分镜"""
        results = []
        
        for panel in panels:
            if rough:
                image = await self.generate_rough(panel, characters, style_guide)
            else:
                image = await self.generate_final(panel, characters, style_guide)
            
            results.append({
                "panel_id": panel.get("id"),
                "image": image,
                "is_rough": rough,
            })
        
        return results


@shared_task(bind=True)
def generate_panel_image_task(
    self,
    project_id: str,
    panel_id: str,
    panel: dict,
    characters: List[dict],
    style_guide: dict,
    rough: bool = False,
):
    """Celery任务：生成单个分镜图"""
    import asyncio
    
    service = ImageGenService()
    loop = asyncio.get_event_loop()
    
    if rough:
        result = loop.run_until_complete(
            service.generate_rough(panel, characters, style_guide)
        )
    else:
        result = loop.run_until_complete(
            service.generate_final(panel, characters, style_guide)
        )
    
    return {
        "panel_id": panel_id,
        "image": result,
        "is_rough": rough,
    }


@shared_task(bind=True)
def generate_panels_batch_task(
    self,
    project_id: str,
    panels: List[dict],
    characters: List[dict],
    style_guide: dict,
    rough: bool = False,
):
    """Celery任务：批量生成分镜图"""
    import asyncio
    
    service = ImageGenService()
    loop = asyncio.get_event_loop()
    
    result = loop.run_until_complete(
        service.generate_batch(panels, characters, style_guide, rough)
    )
    
    return result
