"""Stable Diffusion服务适配器"""

from typing import Optional, List
import httpx

from app.core.config import settings
from app.services.ai.base import BaseImageAdapter


class SDAdapter(BaseImageAdapter):
    """Stable Diffusion WebUI API适配器"""

    def __init__(self):
        self.base_url = settings.SD_API_URL

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
        payload = {
            "prompt": prompt,
            "negative_prompt": negative_prompt or "",
            "width": width,
            "height": height,
            "steps": steps,
            "cfg_scale": cfg_scale,
            "seed": seed,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/sdapi/v1/txt2img",
                json=payload,
                timeout=300.0,
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
        steps: int = 20,
        cfg_scale: float = 7.0,
    ) -> List[str]:
        """图生图"""
        payload = {
            "init_images": [init_image],
            "prompt": prompt,
            "negative_prompt": negative_prompt or "",
            "denoising_strength": strength,
            "steps": steps,
            "cfg_scale": cfg_scale,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/sdapi/v1/img2img",
                json=payload,
                timeout=300.0,
            )
            response.raise_for_status()
            data = response.json()

        return data.get("images", [])
