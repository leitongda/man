"""Step 1: 故事理解与世界观建档"""

from typing import Optional
from celery import shared_task

from app.services.ai import OpenAIAdapter, ClaudeAdapter
from app.schemas.story_bible import StoryBibleResponse, Character, WorldSetting, StyleGuide


STORY_BIBLE_SYSTEM_PROMPT = """你是一个专业的漫画编剧和世界观设计师。
根据用户提供的故事梗概，生成完整的Story Bible（世界观设定）。

输出必须是有效的JSON格式，包含以下结构：
{
    "characters": [角色数组],
    "world": {世界观设定},
    "style_guide": {风格指南},
    "continuity_rules": [一致性规则数组]
}"""

STORY_BIBLE_PROMPT_TEMPLATE = """故事梗概：{story_input}

项目配置：
- 漫画风格：{style}
- 故事基调：{tone}
- 角色数量上限：{max_characters}

请为这个故事生成完整的Story Bible，包括：

1. **角色设定**（Characters）：
   - 每个角色的名字、外观（面部、发型、体型、服装、配饰）
   - 性格特点、口癖、动机
   - 角色之间的关系
   - 用于图像生成的提示词片段

2. **世界观设定**（World）：
   - 时代背景
   - 地点设定
   - 世界规则（魔法/科技/社会制度等）

3. **风格指南**（StyleGuide）：
   - 画风关键词
   - 线条风格
   - 上色风格
   - 材质表现
   - 常用镜头偏好

4. **一致性规则**（ContinuityRules）：
   - 不能改变的视觉元素（如主角发型、标志性道具等）

请用JSON格式输出，确保可以直接解析。"""


class StoryBibleService:
    """世界观建档服务"""
    
    def __init__(self, use_claude: bool = False):
        if use_claude:
            self.ai = ClaudeAdapter()
        else:
            self.ai = OpenAIAdapter()
    
    async def generate(
        self,
        story_input: str,
        style: str = "manga",
        tone: str = "comedy",
        max_characters: int = 5,
    ) -> StoryBibleResponse:
        """生成Story Bible"""
        prompt = STORY_BIBLE_PROMPT_TEMPLATE.format(
            story_input=story_input,
            style=style,
            tone=tone,
            max_characters=max_characters,
        )
        
        response = await self.ai.generate_text(
            prompt=prompt,
            system_prompt=STORY_BIBLE_SYSTEM_PROMPT,
            temperature=0.8,
        )
        
        # 解析JSON响应
        import json
        try:
            # 提取JSON部分
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
                return StoryBibleResponse(**data)
        except (json.JSONDecodeError, ValueError) as e:
            raise ValueError(f"Failed to parse Story Bible response: {e}")
        
        raise ValueError("No valid JSON found in response")


@shared_task(bind=True)
def generate_story_bible_task(self, project_id: str, story_input: str, config: dict):
    """Celery任务：生成Story Bible"""
    import asyncio
    
    service = StoryBibleService()
    loop = asyncio.get_event_loop()
    
    result = loop.run_until_complete(
        service.generate(
            story_input=story_input,
            style=config.get("style", "manga"),
            tone=config.get("tone", "comedy"),
            max_characters=config.get("max_characters", 5),
        )
    )
    
    # TODO: 保存到数据库
    return result.model_dump()
