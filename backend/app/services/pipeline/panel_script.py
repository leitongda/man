"""Step 4: 分镜脚本生成"""

from typing import List
from celery import shared_task

from app.services.ai import OpenAIAdapter, ClaudeAdapter
from app.schemas.storyboard import Scene, Panel, StoryboardResponse


PANEL_SCRIPT_SYSTEM_PROMPT = """你是一个专业的漫画分镜师。
根据章节内容，生成详细的分镜脚本。

输出必须是有效的JSON格式。每个分镜(Panel)都要包含完整的视觉描述。"""

PANEL_SCRIPT_PROMPT_TEMPLATE = """章节信息：
{chapter_info}

角色设定：
{characters}

世界观：
{world}

请为这一章生成分镜脚本，要求：

1. **场景拆分**（Scene）：
   - 切换地点/时间就算一个新场景
   - 每个场景包含：location, time, characters, purpose, mood

2. **分镜脚本**（Panel）：
   每个分镜必须包含以下字段：
   - id: 分镜ID
   - scene_id: 所属场景ID
   - order: 顺序
   - location: 地点
   - time: 时间
   - characters: 出场角色ID数组
   - camera: 镜头类型 (wide/medium/close_up/extreme_close_up/bird_eye/worm_eye)
   - action: 动作描述
   - expression: 表情描述
   - dialogue: 对白数组 [{{character_id, text, type: speech/thought/narration/os}}]
   - sfx: 拟声词数组
   - composition: 构图说明（主体位置、视觉重点）
   - continuity_notes: 一致性备注

预计格数：{estimated_panels}

请用JSON格式输出：
{{
    "scenes": [
        {{
            "id": "scene1",
            "location": "教室",
            "time": "早晨",
            "characters": ["char1"],
            "purpose": "介绍主角",
            "mood": "轻松",
            "panels": [...]
        }}
    ]
}}"""


class PanelScriptService:
    """分镜脚本服务"""
    
    def __init__(self, use_claude: bool = False):
        if use_claude:
            self.ai = ClaudeAdapter()
        else:
            self.ai = OpenAIAdapter()
    
    async def generate_panels(
        self,
        chapter_info: dict,
        characters: List[dict],
        world: dict,
        estimated_panels: int = 12,
    ) -> StoryboardResponse:
        """生成分镜脚本"""
        import json
        
        prompt = PANEL_SCRIPT_PROMPT_TEMPLATE.format(
            chapter_info=json.dumps(chapter_info, ensure_ascii=False, indent=2),
            characters=json.dumps(characters, ensure_ascii=False, indent=2),
            world=json.dumps(world, ensure_ascii=False, indent=2),
            estimated_panels=estimated_panels,
        )
        
        response = await self.ai.generate_text(
            prompt=prompt,
            system_prompt=PANEL_SCRIPT_SYSTEM_PROMPT,
            max_tokens=8192,
            temperature=0.7,
        )
        
        # 解析JSON响应
        try:
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
                return StoryboardResponse(**data)
        except (json.JSONDecodeError, ValueError) as e:
            raise ValueError(f"Failed to parse panel script response: {e}")
        
        raise ValueError("No valid JSON found in response")


@shared_task(bind=True)
def generate_panel_script_task(
    self, 
    project_id: str, 
    chapter_id: str,
    chapter_info: dict, 
    characters: List[dict], 
    world: dict,
    estimated_panels: int
):
    """Celery任务：生成分镜脚本"""
    import asyncio
    
    service = PanelScriptService()
    loop = asyncio.get_event_loop()
    
    result = loop.run_until_complete(
        service.generate_panels(
            chapter_info=chapter_info,
            characters=characters,
            world=world,
            estimated_panels=estimated_panels,
        )
    )
    
    return result.model_dump()
