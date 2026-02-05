"""Step 5: 一致性资产生成"""

from typing import List, Optional
from celery import shared_task

from app.services.ai import OpenAIAdapter
from app.services.ai.sd_adapter import SDAdapter


CHARACTER_SHEET_PROMPT_TEMPLATE = """masterpiece, best quality, character design sheet, 
{character_description},
multiple views, front view, side view, back view,
{style_keywords},
white background, clean lines, professional character sheet"""

EXPRESSION_SHEET_PROMPT_TEMPLATE = """masterpiece, best quality, expression sheet,
{character_description},
{expression} expression,
{style_keywords},
portrait, face close-up, white background"""

ENVIRONMENT_PROMPT_TEMPLATE = """masterpiece, best quality, concept art,
{environment_description},
{style_keywords},
detailed background, environment design"""


class ConsistencyService:
    """一致性资产服务"""
    
    def __init__(self):
        self.text_ai = OpenAIAdapter()
        self.image_ai = SDAdapter()
    
    async def generate_character_sheet(
        self,
        character: dict,
        style_guide: dict,
    ) -> dict:
        """生成角色设定图"""
        # 构建角色描述
        appearance = character.get("appearance", {})
        char_desc = f"{character.get('name', 'character')}, "
        char_desc += f"{appearance.get('face', '')}, "
        char_desc += f"{appearance.get('hair', '')}, "
        char_desc += f"{appearance.get('body', '')}, "
        char_desc += ", ".join(appearance.get("clothing", []))
        
        # 构建风格关键词
        style_keywords = f"{style_guide.get('art_style', 'anime')}, "
        style_keywords += f"{style_guide.get('line_style', '')}, "
        style_keywords += f"{style_guide.get('coloring', '')}"
        
        # 生成三视图
        prompt = CHARACTER_SHEET_PROMPT_TEMPLATE.format(
            character_description=char_desc,
            style_keywords=style_keywords,
        )
        
        images = await self.image_ai.txt2img(
            prompt=prompt,
            negative_prompt="low quality, blurry, bad anatomy, extra limbs",
            width=1024,
            height=768,
            steps=30,
        )
        
        # 生成表情图
        expressions = ["happy", "sad", "angry", "surprised", "neutral", "confused"]
        expression_images = []
        
        for expr in expressions[:6]:  # 生成6张表情
            expr_prompt = EXPRESSION_SHEET_PROMPT_TEMPLATE.format(
                character_description=char_desc,
                expression=expr,
                style_keywords=style_keywords,
            )
            
            expr_images = await self.image_ai.txt2img(
                prompt=expr_prompt,
                negative_prompt="low quality, blurry",
                width=512,
                height=512,
                steps=25,
            )
            
            if expr_images:
                expression_images.append({
                    "emotion": expr,
                    "image": expr_images[0],
                })
        
        return {
            "character_id": character.get("id"),
            "front_view": images[0] if images else None,
            "side_view": None,  # 需要额外生成
            "back_view": None,
            "expressions": expression_images,
            "key_props": [],
            "outfits": [],
        }
    
    async def generate_environment_sheet(
        self,
        environment: dict,
        style_guide: dict,
    ) -> dict:
        """生成场景设定图"""
        style_keywords = f"{style_guide.get('art_style', 'anime')}, "
        style_keywords += f"{style_guide.get('coloring', '')}"
        
        prompt = ENVIRONMENT_PROMPT_TEMPLATE.format(
            environment_description=environment.get("description", ""),
            style_keywords=style_keywords,
        )
        
        images = await self.image_ai.txt2img(
            prompt=prompt,
            negative_prompt="low quality, blurry, text, watermark",
            width=1024,
            height=768,
            steps=30,
        )
        
        return {
            "id": environment.get("id"),
            "name": environment.get("name"),
            "description": environment.get("description"),
            "reference_images": images,
            "prompt_fragments": [prompt],
        }


@shared_task(bind=True)
def generate_character_sheet_task(
    self, 
    project_id: str, 
    character_id: str,
    character: dict,
    style_guide: dict
):
    """Celery任务：生成角色设定图"""
    import asyncio
    
    service = ConsistencyService()
    loop = asyncio.get_event_loop()
    
    result = loop.run_until_complete(
        service.generate_character_sheet(
            character=character,
            style_guide=style_guide,
        )
    )
    
    return result


@shared_task(bind=True)
def generate_environment_sheet_task(
    self,
    project_id: str,
    environment: dict,
    style_guide: dict
):
    """Celery任务：生成场景设定图"""
    import asyncio
    
    service = ConsistencyService()
    loop = asyncio.get_event_loop()
    
    result = loop.run_until_complete(
        service.generate_environment_sheet(
            environment=environment,
            style_guide=style_guide,
        )
    )
    
    return result
