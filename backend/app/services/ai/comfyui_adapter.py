"""ComfyUI服务适配器"""

from typing import Optional, List, Dict, Any
import httpx
import json
import uuid

from app.core.config import settings
from app.services.ai.base import BaseImageAdapter


class ComfyUIAdapter(BaseImageAdapter):
    """ComfyUI API适配器"""

    def __init__(
        self,
        base_url: Optional[str] = None,
        workflow_template: Optional[str] = None,
        timeout: int = 300,
    ):
        """初始化 ComfyUI 适配器
        
        Args:
            base_url: API 基础 URL
            workflow_template: 默认工作流模板 ID
            timeout: 请求超时时间（秒）
        """
        self.base_url = base_url or settings.COMFYUI_API_URL
        self.workflow_template = workflow_template
        self.timeout = timeout
        self.client_id = str(uuid.uuid4())

    async def _queue_prompt(self, workflow: Dict[str, Any]) -> str:
        """提交工作流到队列"""
        payload = {
            "prompt": workflow,
            "client_id": self.client_id,
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/prompt",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        return data["prompt_id"]

    async def _get_history(self, prompt_id: str) -> Dict[str, Any]:
        """获取执行历史"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/history/{prompt_id}",
            )
            response.raise_for_status()
            return response.json()

    async def _get_image(self, filename: str, subfolder: str, folder_type: str) -> bytes:
        """获取图像"""
        params = {
            "filename": filename,
            "subfolder": subfolder,
            "type": folder_type,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/view",
                params=params,
            )
            response.raise_for_status()
            return response.content

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
        """文生图 - 使用基础工作流"""
        # TODO: 实现ComfyUI工作流
        raise NotImplementedError("ComfyUI txt2img not implemented yet")

    async def img2img(
        self,
        init_image: str,
        prompt: str,
        negative_prompt: Optional[str] = None,
        strength: float = 0.75,
        steps: int = 20,
        cfg_scale: float = 7.0,
    ) -> List[str]:
        """图生图 - 使用基础工作流"""
        # TODO: 实现ComfyUI工作流
        raise NotImplementedError("ComfyUI img2img not implemented yet")

    async def run_workflow(self, workflow: Dict[str, Any]) -> List[str]:
        """运行自定义工作流"""
        prompt_id = await self._queue_prompt(workflow)
        
        # 等待执行完成
        import asyncio
        max_wait = 300  # 最大等待5分钟
        wait_time = 0
        
        while wait_time < max_wait:
            await asyncio.sleep(2)
            wait_time += 2
            
            history = await self._get_history(prompt_id)
            if prompt_id in history:
                outputs = history[prompt_id].get("outputs", {})
                images = []
                
                for node_id, output in outputs.items():
                    if "images" in output:
                        for img in output["images"]:
                            img_data = await self._get_image(
                                img["filename"],
                                img.get("subfolder", ""),
                                img.get("type", "output"),
                            )
                            # 转为base64
                            import base64
                            images.append(base64.b64encode(img_data).decode("utf-8"))
                
                return images
        
        raise TimeoutError("ComfyUI workflow execution timeout")
