"""AI服务适配器基类"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any


class BaseAIAdapter(ABC):
    """AI服务适配器基类"""

    @abstractmethod
    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        max_tokens: int = 4096,
        temperature: float = 0.7,
    ) -> str:
        """生成文本"""
        pass

    @abstractmethod
    async def generate_image(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        num_images: int = 1,
    ) -> List[str]:
        """生成图像，返回图像URL或base64列表"""
        pass

    @abstractmethod
    async def analyze_image(
        self,
        image_url: str,
        prompt: str,
    ) -> str:
        """分析图像"""
        pass


class BaseImageAdapter(ABC):
    """图像生成服务适配器基类"""

    @abstractmethod
    async def txt2img(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: int = 1024,
        height: int = 1024,
        steps: int = 20,
        cfg_scale: float = 7.0,
        seed: int = -1,
    ) -> List[str]:
        """文生图"""
        pass

    @abstractmethod
    async def img2img(
        self,
        init_image: str,
        prompt: str,
        negative_prompt: Optional[str] = None,
        strength: float = 0.75,
        steps: int = 20,
        cfg_scale: float = 7.0,
    ) -> List[str]:
        """图生图"""
        pass
