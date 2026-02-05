"""Step 2: 故事扩写"""

from typing import Literal
from celery import shared_task

from app.services.ai import OpenAIAdapter, ClaudeAdapter
from app.schemas.story import StoryOutlineResponse, Beat


STORY_EXPAND_SYSTEM_PROMPT = """你是一个专业的故事编剧。
根据用户提供的故事梗概和世界观设定，扩写成完整的故事。

输出必须是有效的JSON格式，包含以下结构：
{
    "synopsis_short": "短版故事（1000-2000字）",
    "synopsis_mid": "中版故事（5000-12000字）",
    "key_beats": [关键节拍数组],
    "outline": [结构化大纲数组]
}"""

STORY_EXPAND_PROMPT_TEMPLATE = """故事梗概：{story_input}

世界观设定：
{story_bible}

请将这个故事扩写为{length}版本，并生成结构化大纲。

要求：
1. **故事版本**：
   - 短版(short)：1000-2000字，适合1章
   - 中版(mid)：5000-12000字，适合3-6章
   - 长版(long)：更长，适合连载

2. **关键节拍**（key_beats）：
   - 起承转合的关键点
   - 反转点、高潮点
   - 每个节拍包含：id, order, type(setup/conflict/twist/climax/resolution), description, characters_involved

3. **结构化大纲**（outline）：
   - Beat 1: 主角登场 + 目标出现
   - Beat 2: 冲突升级
   - Beat 3: 误会/反转
   - Beat 4: 高潮对抗
   - Beat 5: 结局/钩子

请用JSON格式输出。"""


class StoryExpandService:
    """故事扩写服务"""
    
    def __init__(self, use_claude: bool = False):
        if use_claude:
            self.ai = ClaudeAdapter()
        else:
            self.ai = OpenAIAdapter()
    
    async def expand(
        self,
        story_input: str,
        story_bible: dict,
        length: Literal["short", "mid", "long"] = "short",
    ) -> StoryOutlineResponse:
        """扩写故事"""
        import json
        
        prompt = STORY_EXPAND_PROMPT_TEMPLATE.format(
            story_input=story_input,
            story_bible=json.dumps(story_bible, ensure_ascii=False, indent=2),
            length=length,
        )
        
        response = await self.ai.generate_text(
            prompt=prompt,
            system_prompt=STORY_EXPAND_SYSTEM_PROMPT,
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
                return StoryOutlineResponse(**data)
        except (json.JSONDecodeError, ValueError) as e:
            raise ValueError(f"Failed to parse story response: {e}")
        
        raise ValueError("No valid JSON found in response")


@shared_task(bind=True)
def expand_story_task(self, project_id: str, story_input: str, story_bible: dict, length: str):
    """Celery任务：扩写故事"""
    import asyncio
    
    service = StoryExpandService()
    loop = asyncio.get_event_loop()
    
    result = loop.run_until_complete(
        service.expand(
            story_input=story_input,
            story_bible=story_bible,
            length=length,
        )
    )
    
    return result.model_dump()
