"""AI模型配置数据模型"""

import uuid
from enum import Enum
from datetime import datetime
from sqlalchemy import Column, String, Text, JSON, DateTime, Integer, Float, Boolean, Enum as SQLEnum

from app.core.database import Base


class ModelProvider(str, Enum):
    """模型提供商枚举"""
    openai = "openai"                       # OpenAI 官方
    openai_compatible = "openai_compatible" # OpenAI 兼容(Azure/Ollama/vLLM等)
    anthropic = "anthropic"                 # Anthropic Claude
    zhipu = "zhipu"                         # 智谱AI (GLM)
    stable_diffusion = "stable_diffusion"   # SD WebUI
    comfyui = "comfyui"                     # ComfyUI
    midjourney = "midjourney"               # Midjourney


class ModelType(str, Enum):
    """模型类型枚举"""
    text_generation = "text_generation"     # 文本生成
    image_generation = "image_generation"   # 图像生成
    image_analysis = "image_analysis"       # 图像分析/视觉


class AIModel(Base):
    """AI模型配置模型"""
    __tablename__ = "ai_models"

    # === 基础字段 ===
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, comment="显示名称")
    provider = Column(
        SQLEnum(ModelProvider, name="model_provider"),
        nullable=False,
        comment="提供商类型"
    )
    model_type = Column(
        SQLEnum(ModelType, name="model_type"),
        nullable=False,
        comment="模型类型"
    )
    model_name = Column(String(100), nullable=False, comment="实际模型名称")

    # === 连接配置 ===
    api_key = Column(Text, nullable=True, comment="API密钥(加密存储)")
    base_url = Column(String(500), nullable=True, comment="API基础URL")
    api_version = Column(String(50), nullable=True, comment="API版本(Azure等需要)")
    organization_id = Column(String(100), nullable=True, comment="组织ID(OpenAI)")
    deployment_name = Column(String(100), nullable=True, comment="部署名称(Azure)")

    # === 文本生成配置 ===
    default_max_tokens = Column(Integer, nullable=True, comment="默认最大token")
    default_temperature = Column(Float, nullable=True, comment="默认温度")

    # === 图像生成配置 ===
    default_width = Column(Integer, nullable=True, comment="默认宽度")
    default_height = Column(Integer, nullable=True, comment="默认高度")
    default_steps = Column(Integer, nullable=True, comment="默认步数(SD/ComfyUI)")
    default_cfg_scale = Column(Float, nullable=True, comment="默认CFG(SD/ComfyUI)")
    default_sampler = Column(String(50), nullable=True, comment="默认采样器(SD)")
    checkpoint_name = Column(String(200), nullable=True, comment="模型文件名(SD)")
    workflow_template = Column(String(100), nullable=True, comment="工作流模板(ComfyUI)")

    # === 通用配置 ===
    timeout = Column(Integer, default=300, comment="请求超时(秒)")
    extra_headers = Column(JSON, nullable=True, comment="额外请求头")
    extra_config = Column(JSON, default=dict, comment="其他扩展配置")

    # === 状态字段 ===
    is_enabled = Column(Boolean, default=True, comment="是否启用")
    is_default = Column(Boolean, default=False, comment="是否为该类型的默认模型")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<AIModel {self.name} ({self.provider.value}/{self.model_name})>"
