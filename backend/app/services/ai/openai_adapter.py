"""OpenAI服务适配器"""

from typing import Optional, List, Dict
from openai import AsyncOpenAI

from app.core.config import settings
from app.services.ai.base import BaseAIAdapter


class OpenAIAdapter(BaseAIAdapter):
    """OpenAI服务适配器
    
    支持 OpenAI 官方 API 和兼容 API（Azure、Ollama、vLLM 等）
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model_name: str = "gpt-4-turbo-preview",
        organization: Optional[str] = None,
        default_max_tokens: Optional[int] = None,
        default_temperature: Optional[float] = None,
        timeout: int = 300,
        extra_headers: Optional[Dict[str, str]] = None,
    ):
        """初始化 OpenAI 适配器
        
        Args:
            api_key: API 密钥，不提供则使用环境变量
            base_url: API 基础 URL，用于兼容 API
            model_name: 模型名称
            organization: OpenAI 组织 ID
            default_max_tokens: 默认最大 token 数
            default_temperature: 默认温度
            timeout: 请求超时时间（秒）
            extra_headers: 额外请求头
        """
        self.model_name = model_name
        self.default_max_tokens = default_max_tokens or 4096
        self.default_temperature = default_temperature or 0.7
        
        # 使用提供的配置或回退到环境变量
        self.client = AsyncOpenAI(
            api_key=api_key or settings.OPENAI_API_KEY,
            base_url=base_url,
            organization=organization,
            timeout=timeout,
            default_headers=extra_headers,
        )

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None,
    ) -> str:
        """使用GPT生成文本"""
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.client.chat.completions.create(
            model=self.model_name,
            messages=messages,
            max_tokens=max_tokens or self.default_max_tokens,
            temperature=temperature or self.default_temperature,
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

        # 使用配置的模型名称或默认 dall-e-3
        image_model = self.model_name if "dall-e" in self.model_name else "dall-e-3"

        response = await self.client.images.generate(
            model=image_model,
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
        # 使用配置的模型名称或默认视觉模型
        vision_model = self.model_name if "vision" in self.model_name or "gpt-4o" in self.model_name else "gpt-4-vision-preview"
        
        response = await self.client.chat.completions.create(
            model=vision_model,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": image_url}},
                    ],
                }
            ],
            max_tokens=self.default_max_tokens,
        )

        return response.choices[0].message.content
