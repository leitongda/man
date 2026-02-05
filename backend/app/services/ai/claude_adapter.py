"""Claude服务适配器"""

from typing import Optional, List
from anthropic import AsyncAnthropic

from app.core.config import settings
from app.services.ai.base import BaseAIAdapter


class ClaudeAdapter(BaseAIAdapter):
    """Claude服务适配器"""

    def __init__(self):
        self.client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> str:
        """使用Claude生成文本"""
        response = await self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=max_tokens,
            system=system_prompt or "",
            messages=[{"role": "user", "content": prompt}],
        )

        return response.content[0].text

    async def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        num_images: int = 1,
    ) -> List[str]:
        """Claude不支持图像生成，抛出异常"""
        raise NotImplementedError("Claude does not support image generation")

    async def analyze_image(
        self,
        image_url: str,
        prompt: str,
    ) -> str:
        """使用Claude分析图像"""
        import httpx
        import base64

        # 下载图像并转为base64
        async with httpx.AsyncClient() as client:
            response = await client.get(image_url)
            image_data = base64.b64encode(response.content).decode("utf-8")

        # 获取图像类型
        content_type = response.headers.get("content-type", "image/jpeg")

        response = await self.client.messages.create(
            model="claude-3-opus-20240229",
            max_tokens=1024,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": content_type,
                                "data": image_data,
                            },
                        },
                        {"type": "text", "text": prompt},
                    ],
                }
            ],
        )

        return response.content[0].text
