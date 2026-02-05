"""AI适配器工厂"""

from typing import Optional, Union
from sqlalchemy.orm import Session

from app.models.ai_model import AIModel, ModelProvider, ModelType
from app.services.ai_model_service import AIModelService
from app.services.ai.base import BaseAIAdapter, BaseImageAdapter
from app.core.encryption import decrypt_api_key


class AIAdapterFactory:
    """AI适配器工厂
    
    根据数据库中的模型配置动态创建适配器实例
    """

    @staticmethod
    def get_text_adapter(
        db: Session,
        model_id: Optional[str] = None,
    ) -> BaseAIAdapter:
        """获取文本生成适配器
        
        Args:
            db: 数据库会话
            model_id: 指定模型ID，不指定则使用默认模型
            
        Returns:
            文本生成适配器实例
        """
        model = AIAdapterFactory._get_model(db, model_id, ModelType.text_generation)
        return AIAdapterFactory._create_text_adapter(model)

    @staticmethod
    def get_image_adapter(
        db: Session,
        model_id: Optional[str] = None,
    ) -> Union[BaseAIAdapter, BaseImageAdapter]:
        """获取图像生成适配器
        
        Args:
            db: 数据库会话
            model_id: 指定模型ID，不指定则使用默认模型
            
        Returns:
            图像生成适配器实例
        """
        model = AIAdapterFactory._get_model(db, model_id, ModelType.image_generation)
        return AIAdapterFactory._create_image_adapter(model)

    @staticmethod
    def get_vision_adapter(
        db: Session,
        model_id: Optional[str] = None,
    ) -> BaseAIAdapter:
        """获取图像分析/视觉适配器
        
        Args:
            db: 数据库会话
            model_id: 指定模型ID，不指定则使用默认模型
            
        Returns:
            图像分析适配器实例
        """
        model = AIAdapterFactory._get_model(db, model_id, ModelType.image_analysis)
        # 图像分析使用文本适配器（支持视觉功能）
        return AIAdapterFactory._create_text_adapter(model)

    @staticmethod
    def _get_model(
        db: Session,
        model_id: Optional[str],
        model_type: ModelType,
    ) -> AIModel:
        """获取模型配置
        
        Args:
            db: 数据库会话
            model_id: 模型ID（可选）
            model_type: 模型类型
            
        Returns:
            模型配置对象
            
        Raises:
            ValueError: 模型不存在或未配置默认模型
        """
        if model_id:
            model = AIModelService.get_model(db, model_id)
            if not model:
                raise ValueError(f"模型配置不存在: {model_id}")
            if not model.is_enabled:
                raise ValueError(f"模型已禁用: {model.name}")
            return model

        # 使用默认模型
        model = AIModelService.get_default_model(db, model_type)
        if not model:
            raise ValueError(f"未配置 {model_type.value} 类型的默认模型")
        return model

    @staticmethod
    def _create_text_adapter(model: AIModel) -> BaseAIAdapter:
        """根据配置创建文本适配器"""
        api_key = decrypt_api_key(model.api_key) if model.api_key else None

        if model.provider in [ModelProvider.openai, ModelProvider.openai_compatible]:
            from app.services.ai.openai_adapter import OpenAIAdapter
            return OpenAIAdapter(
                api_key=api_key,
                base_url=model.base_url,
                model_name=model.model_name,
                organization=model.organization_id,
                default_max_tokens=model.default_max_tokens,
                default_temperature=model.default_temperature,
                timeout=model.timeout,
                extra_headers=model.extra_headers,
            )
        elif model.provider == ModelProvider.anthropic:
            from app.services.ai.claude_adapter import ClaudeAdapter
            return ClaudeAdapter(
                api_key=api_key,
                base_url=model.base_url,
                model_name=model.model_name,
                default_max_tokens=model.default_max_tokens,
                timeout=model.timeout,
            )
        else:
            raise ValueError(f"不支持的文本模型提供商: {model.provider.value}")

    @staticmethod
    def _create_image_adapter(model: AIModel) -> Union[BaseAIAdapter, BaseImageAdapter]:
        """根据配置创建图像适配器"""
        api_key = decrypt_api_key(model.api_key) if model.api_key else None

        if model.provider == ModelProvider.stable_diffusion:
            from app.services.ai.sd_adapter import SDAdapter
            return SDAdapter(
                base_url=model.base_url,
                default_width=model.default_width,
                default_height=model.default_height,
                default_steps=model.default_steps,
                default_cfg_scale=model.default_cfg_scale,
                default_sampler=model.default_sampler,
                checkpoint_name=model.checkpoint_name,
                timeout=model.timeout,
            )
        elif model.provider == ModelProvider.comfyui:
            from app.services.ai.comfyui_adapter import ComfyUIAdapter
            return ComfyUIAdapter(
                base_url=model.base_url,
                workflow_template=model.workflow_template,
                timeout=model.timeout,
            )
        elif model.provider == ModelProvider.openai:
            # DALL-E 使用 OpenAI 适配器
            from app.services.ai.openai_adapter import OpenAIAdapter
            return OpenAIAdapter(
                api_key=api_key,
                base_url=model.base_url,
                model_name=model.model_name,
                timeout=model.timeout,
            )
        elif model.provider == ModelProvider.midjourney:
            from app.services.ai.midjourney_adapter import MidjourneyAdapter
            return MidjourneyAdapter(
                api_key=api_key,
                base_url=model.base_url,
                timeout=model.timeout,
            )
        else:
            raise ValueError(f"不支持的图像模型提供商: {model.provider.value}")
