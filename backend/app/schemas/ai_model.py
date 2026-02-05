"""AI模型配置相关Schema"""

from datetime import datetime
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, model_validator

from app.models.ai_model import ModelProvider, ModelType


class AIModelCreate(BaseModel):
    """创建模型配置请求"""
    # 基础字段
    name: str
    provider: ModelProvider
    model_type: ModelType
    model_name: str

    # 连接配置
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    api_version: Optional[str] = None
    organization_id: Optional[str] = None
    deployment_name: Optional[str] = None

    # 文本生成配置
    default_max_tokens: Optional[int] = None
    default_temperature: Optional[float] = None

    # 图像生成配置
    default_width: Optional[int] = None
    default_height: Optional[int] = None
    default_steps: Optional[int] = None
    default_cfg_scale: Optional[float] = None
    default_sampler: Optional[str] = None
    checkpoint_name: Optional[str] = None
    workflow_template: Optional[str] = None

    # 通用配置
    timeout: int = 300
    extra_headers: Optional[Dict[str, str]] = None
    extra_config: Optional[Dict[str, Any]] = None

    is_enabled: bool = True
    is_default: bool = False

    @model_validator(mode='after')
    def validate_provider_fields(self):
        """根据供应商类型验证必需字段"""
        if self.provider in [ModelProvider.openai, ModelProvider.anthropic]:
            if not self.api_key:
                raise ValueError(f"{self.provider.value} 需要提供 api_key")
        if self.provider == ModelProvider.openai_compatible:
            if not self.api_key or not self.base_url:
                raise ValueError("openai_compatible 需要提供 api_key 和 base_url")
        if self.provider in [ModelProvider.stable_diffusion, ModelProvider.comfyui]:
            if not self.base_url:
                raise ValueError(f"{self.provider.value} 需要提供 base_url")
        if self.provider == ModelProvider.midjourney:
            if not self.api_key or not self.base_url:
                raise ValueError("midjourney 需要提供 api_key 和 base_url")
        return self


class AIModelUpdate(BaseModel):
    """更新模型配置请求 - 所有字段可选"""
    name: Optional[str] = None
    model_name: Optional[str] = None
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    api_version: Optional[str] = None
    organization_id: Optional[str] = None
    deployment_name: Optional[str] = None

    default_max_tokens: Optional[int] = None
    default_temperature: Optional[float] = None

    default_width: Optional[int] = None
    default_height: Optional[int] = None
    default_steps: Optional[int] = None
    default_cfg_scale: Optional[float] = None
    default_sampler: Optional[str] = None
    checkpoint_name: Optional[str] = None
    workflow_template: Optional[str] = None

    timeout: Optional[int] = None
    extra_headers: Optional[Dict[str, str]] = None
    extra_config: Optional[Dict[str, Any]] = None

    is_enabled: Optional[bool] = None
    is_default: Optional[bool] = None


class AIModelResponse(BaseModel):
    """模型配置响应"""
    id: str
    name: str
    provider: ModelProvider
    model_type: ModelType
    model_name: str

    # 连接配置（不返回 api_key）
    base_url: Optional[str] = None
    api_version: Optional[str] = None
    organization_id: Optional[str] = None
    deployment_name: Optional[str] = None
    has_api_key: bool  # 只返回是否配置了密钥

    # 文本生成配置
    default_max_tokens: Optional[int] = None
    default_temperature: Optional[float] = None

    # 图像生成配置
    default_width: Optional[int] = None
    default_height: Optional[int] = None
    default_steps: Optional[int] = None
    default_cfg_scale: Optional[float] = None
    default_sampler: Optional[str] = None
    checkpoint_name: Optional[str] = None
    workflow_template: Optional[str] = None

    # 通用配置
    timeout: int
    extra_headers: Optional[Dict[str, str]] = None
    extra_config: Optional[Dict[str, Any]] = None

    is_enabled: bool
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIModelListResponse(BaseModel):
    """模型列表响应"""
    items: List[AIModelResponse]
    total: int


class AIModelTestResult(BaseModel):
    """模型连接测试结果"""
    success: bool
    message: str
    latency_ms: Optional[float] = None


class DefaultModelsResponse(BaseModel):
    """各类型默认模型响应"""
    text_generation: Optional[AIModelResponse] = None
    image_generation: Optional[AIModelResponse] = None
    image_analysis: Optional[AIModelResponse] = None
