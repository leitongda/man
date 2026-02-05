"""OpenAI服务适配器"""

from typing import Optional, List
from openai import AsyncOpenAI

from app.core.config import settings
from app.services.ai.base import BaseAIAdapter


class OpenAIAdapter(BaseAIAdapter):
    """OpenAI服务适配器"""

    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> str:
        """使用GPT生成文本"""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model="gpt-4-turbo-preview",
            messages=messages,
            max_tokens=max_tokens,
            temperature=temperature,
        )

        return response.choices[0].message.content

    async def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        num_images: int = 1,
    ) -> List[str]:
        """使用DALL-E生成图像"""
        # DALL-E 3只支持特定尺寸
        size = "1024x1024"
        if width > height:
            size = "1792x1024"
        elif height > width:
            size = "1024x1792"

        response = await self.client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size=size,
            quality="standard",
            n=1,  # DALL-E 3只支持n=1
        )

        return [img.url for img in response.data]

    async def analyze_image(
        self,
        image_url: str,
        prompt: str,
    ) -> str:
        """使用GPT-4V分析图像"""
        response = await self.client.chat.completions.create(
            model="gpt-4-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
            max_tokens=1024,
        )

        return response.choices[0].message.content
