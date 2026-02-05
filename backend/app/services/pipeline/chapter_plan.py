"""Step 3: 分章节规划"""

from typing import List
from celery import shared_task

from app.services.ai import OpenAIAdapter, ClaudeAdapter
from app.schemas.chapter import ChapterResponse


CHAPTER_PLAN_SYSTEM_PROMPT = """你是一个专业的漫画分镜编剧。
根据故事大纲，将故事划分为章节。

输出必须是有效的JSON格式，包含chapters数组。"""

CHAPTER_PLAN_PROMPT_TEMPLATE = """故事大纲：
{story_outline}

配置：
- 每章预计格数：{panels_per_chapter}
- 目标章节数：{target_chapters}

请将这个故事划分为章节，每章需要：
1. **logline**：一句话概括本章内容
2. **beats**：本章包含的节拍ID
3. **cliffhanger**：章末钩子/悬念
4. **estimated_panels**：预计格数

要求：
- 每章有一个小闭环（引子/冲突/小高潮/留悬念）
- 控制每章的角色出场和场景数量
- 章节间有连贯性，情节递进

请用JSON格式输出：
{{
    "chapters": [
        {{
            "id": "ch1",
            "order": 1,
            "title": "章节标题",
            "logline": "一句话概括",
            "beats": ["beat1", "beat2"],
            "cliffhanger": "章末悬念",
            "estimated_panels": 12
        }}
    ]
}}"""


class ChapterPlanService:
    """章节规划服务"""
    
    def __init__(self, use_claude: bool = False):
        if use_claude:
            self.ai = ClaudeAdapter()
        else:
            self.ai = OpenAIAdapter()
    
    async def plan_chapters(
        self,
        story_outline: dict,
        panels_per_chapter: int = 12,
        target_chapters: int = 1,
    ) -> List[ChapterResponse]:
        """规划章节"""
        import json
        
        prompt = CHAPTER_PLAN_PROMPT_TEMPLATE.format(
            story_outline=json.dumps(story_outline, ensure_ascii=False, indent=2),
            panels_per_chapter=panels_per_chapter,
            target_chapters=target_chapters,
        )
        
        response = await self.ai.generate_text(
            prompt=prompt,
            system_prompt=CHAPTER_PLAN_SYSTEM_PROMPT,
            temperature=0.6,
        )
        
        # 解析JSON响应
        try:
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                data = json.loads(json_str)
                chapters = data.get("chapters", [])
                return [ChapterResponse(**ch) for ch in chapters]
        except (json.JSONDecodeError, ValueError) as e:
            raise ValueError(f"Failed to parse chapters response: {e}")
        
        raise ValueError("No valid JSON found in response")


@shared_task(bind=True)
def plan_chapters_task(self, project_id: str, story_outline: dict, config: dict):
    """Celery任务：规划章节"""
    import asyncio
    
    service = ChapterPlanService()
    loop = asyncio.get_event_loop()
    
    result = loop.run_until_complete(
        service.plan_chapters(
            story_outline=story_outline,
            panels_per_chapter=config.get("panels_per_chapter", 12),
            target_chapters=config.get("target_chapters", 1),
        )
    )
    
    return [ch.model_dump() for ch in result]
