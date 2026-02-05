"""Claude服务适配器"""

from typing import Optional, List
from anthropic import AsyncAnthropic

from app.core.config import settings
from app.services.ai.base import BaseAIAdapter


class ClaudeAdapter(BaseAIAdapter):
    """Claude服务适配器"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model_name: str = "claude-3-opus-20240229",
        default_max_tokens: Optional[int] = None,
        timeout: int = 300,
    ):
        """初始化 Claude 适配器
        
        Args:
            api_key: API 密钥，不提供则使用环境变量
            base_url: API 基础 URL
            model_name: 模型名称
            default_max_tokens: 默认最大 token 数
            timeout: 请求超时时间（秒）
        """
        self.model_name = model_name
        self.default_max_tokens = default_max_tokens or 4096
        
        self.client = AsyncAnthropic(
            api_key=api_key or settings.ANTHROPIC_API_KEY,
            base_url=base_url,
            timeout=timeout,
        )

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: Optional[int] = None,
        temperature: float = 0.7,
    ) -> str:
        """使用Claude生成文本"""
        response = await self.client.messages.create(
            model=self.model_name,
            max_tokens=max_tokens or self.default_max_tokens,
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
            model=self.model_name,
            max_tokens=self.default_max_tokens,
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
