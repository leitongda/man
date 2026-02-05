"""Stable Diffusion服务适配器"""

from typing import Optional, List
import httpx

from app.core.config import settings
from app.services.ai.base import BaseImageAdapter


class SDAdapter(BaseImageAdapter):
    """Stable Diffusion WebUI API适配器"""

    def __init__(
        self,
        base_url: Optional[str] = None,
        default_width: Optional[int] = None,
        default_height: Optional[int] = None,
        default_steps: Optional[int] = None,
        default_cfg_scale: Optional[float] = None,
        default_sampler: Optional[str] = None,
        checkpoint_name: Optional[str] = None,
        timeout: int = 300,
    ):
        """初始化 Stable Diffusion 适配器
        
        Args:
            base_url: API 基础 URL
            default_width: 默认宽度
            default_height: 默认高度
            default_steps: 默认步数
            default_cfg_scale: 默认 CFG 值
            default_sampler: 默认采样器
            checkpoint_name: 模型文件名
            timeout: 请求超时时间（秒）
        """
        self.base_url = base_url or settings.SD_API_URL
        self.default_width = default_width or 1024
        self.default_height = default_height or 1024
        self.default_steps = default_steps or 20
        self.default_cfg_scale = default_cfg_scale or 7.0
        self.default_sampler = default_sampler
        self.checkpoint_name = checkpoint_name
        self.timeout = timeout

    async def txt2img(
        self,
        prompt: str,
        negative_prompt: Optional[str] = None,
        width: Optional[int] = None,
        height: Optional[int] = None,
        steps: Optional[int] = None,
        cfg_scale: Optional[float] = None,
        seed: int = -1,
        sampler: Optional[str] = None,
    ) -> List[str]:
        """文生图"""
        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt or "",
            "width": width or self.default_width,
            "height": height or self.default_height,
            "steps": steps or self.default_steps,
            "cfg_scale": cfg_scale or self.default_cfg_scale,
            "seed": seed,
        }
        
        # 添加采样器配置
        if sampler or self.default_sampler:
            payload["sampler_name"] = sampler or self.default_sampler
        
        # 添加模型配置
        if self.checkpoint_name:
            payload["override_settings"] = {
                "sd_model_checkpoint": self.checkpoint_name
            }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/sdapi/v1/txt2img",
                json=payload,
                timeout=float(self.timeout),
            )
            response.raise_for_status()
            data = response.json()

        return data.get("images", [])

    async def img2img(
        self,
        init_image: str,
        prompt: str,
        negative_prompt: Optional[str] = None,
        strength: float = 0.75,
        steps: Optional[int] = None,
        cfg_scale: Optional[float] = None,
        sampler: Optional[str] = None,
    ) -> List[str]:
        """图生图"""
        payload = {
            "init_images": [init_image],
            "prompt": prompt,
            "negative_prompt": negative_prompt or "",
            "denoising_strength": strength,
            "steps": steps or self.default_steps,
            "cfg_scale": cfg_scale or self.default_cfg_scale,
        }
        
        # 添加采样器配置
        if sampler or self.default_sampler:
            payload["sampler_name"] = sampler or self.default_sampler
        
        # 添加模型配置
        if self.checkpoint_name:
            payload["override_settings"] = {
                "sd_model_checkpoint": self.checkpoint_name
            }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/sdapi/v1/img2img",
                json=payload,
                timeout=float(self.timeout),
            )
            response.raise_for_status()
            data = response.json()

        return data.get("images", [])
