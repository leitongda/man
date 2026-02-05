"""AI模型配置服务"""

import uuid
import time
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.ai_model import AIModel, ModelProvider, ModelType
from app.schemas.ai_model import AIModelCreate, AIModelUpdate, AIModelResponse, AIModelTestResult
from app.core.encryption import encrypt_api_key, decrypt_api_key


class AIModelService:
    """AI模型配置服务"""

    @staticmethod
    def create_model(db: Session, data: AIModelCreate) -> AIModel:
        """创建模型配置"""
        # 加密 API 密钥
        encrypted_key = encrypt_api_key(data.api_key) if data.api_key else None

        # 如果设置为默认，先取消该类型的其他默认
        if data.is_default:
            AIModelService._clear_default(db, data.model_type)

        model = AIModel(
            id=str(uuid.uuid4()),
            name=data.name,
            provider=data.provider,
            model_type=data.model_type,
            model_name=data.model_name,
            api_key=encrypted_key,
            base_url=data.base_url,
            api_version=data.api_version,
            organization_id=data.organization_id,
            deployment_name=data.deployment_name,
            default_max_tokens=data.default_max_tokens,
            default_temperature=data.default_temperature,
            default_width=data.default_width,
            default_height=data.default_height,
            default_steps=data.default_steps,
            default_cfg_scale=data.default_cfg_scale,
            default_sampler=data.default_sampler,
            checkpoint_name=data.checkpoint_name,
            workflow_template=data.workflow_template,
            timeout=data.timeout,
            extra_headers=data.extra_headers,
            extra_config=data.extra_config or {},
            is_enabled=data.is_enabled,
            is_default=data.is_default,
        )

        db.add(model)
        db.commit()
        db.refresh(model)
        return model

    @staticmethod
    def get_model(db: Session, model_id: str) -> Optional[AIModel]:
        """获取模型配置"""
        return db.query(AIModel).filter(AIModel.id == model_id).first()

    @staticmethod
    def get_model_or_raise(db: Session, model_id: str) -> AIModel:
        """获取模型配置，不存在则抛出异常"""
        model = AIModelService.get_model(db, model_id)
        if not model:
            raise ValueError(f"模型配置不存在: {model_id}")
        return model

    @staticmethod
    def list_models(
        db: Session,
        model_type: Optional[ModelType] = None,
        provider: Optional[ModelProvider] = None,
        is_enabled: Optional[bool] = None,
    ) -> List[AIModel]:
        """获取模型列表"""
        query = db.query(AIModel)

        if model_type:
            query = query.filter(AIModel.model_type == model_type)
        if provider:
            query = query.filter(AIModel.provider == provider)
        if is_enabled is not None:
            query = query.filter(AIModel.is_enabled == is_enabled)

        return query.order_by(AIModel.model_type, AIModel.is_default.desc(), AIModel.name).all()

    @staticmethod
    def update_model(db: Session, model_id: str, data: AIModelUpdate) -> AIModel:
        """更新模型配置"""
        model = AIModelService.get_model_or_raise(db, model_id)

        update_data = data.model_dump(exclude_unset=True)

        # 处理 API 密钥加密
        if "api_key" in update_data and update_data["api_key"]:
            update_data["api_key"] = encrypt_api_key(update_data["api_key"])

        # 如果设置为默认，先取消该类型的其他默认
        if update_data.get("is_default"):
            AIModelService._clear_default(db, model.model_type)

        for key, value in update_data.items():
            setattr(model, key, value)

        db.commit()
        db.refresh(model)
        return model

    @staticmethod
    def delete_model(db: Session, model_id: str) -> bool:
        """删除模型配置"""
        model = AIModelService.get_model(db, model_id)
        if not model:
            return False

        db.delete(model)
        db.commit()
        return True

    @staticmethod
    def set_default_model(db: Session, model_id: str) -> AIModel:
        """设置为默认模型"""
        model = AIModelService.get_model_or_raise(db, model_id)

        # 取消该类型的其他默认
        AIModelService._clear_default(db, model.model_type)

        # 设置当前模型为默认
        model.is_default = True
        db.commit()
        db.refresh(model)
        return model

    @staticmethod
    def get_default_model(db: Session, model_type: ModelType) -> Optional[AIModel]:
        """获取指定类型的默认模型"""
        return db.query(AIModel).filter(
            and_(
                AIModel.model_type == model_type,
                AIModel.is_default == True,
                AIModel.is_enabled == True,
            )
        ).first()

    @staticmethod
    def get_all_defaults(db: Session) -> dict:
        """获取所有类型的默认模型"""
        result = {}
        for model_type in ModelType:
            model = AIModelService.get_default_model(db, model_type)
            result[model_type.value] = model
        return result

    @staticmethod
    async def test_connection(db: Session, model_id: str) -> AIModelTestResult:
        """测试模型连接"""
        model = AIModelService.get_model_or_raise(db, model_id)

        start_time = time.time()

        try:
            # 根据模型类型和提供商进行测试
            api_key = decrypt_api_key(model.api_key) if model.api_key else None

            if model.provider in [ModelProvider.openai, ModelProvider.openai_compatible]:
                await AIModelService._test_openai(model, api_key)
            elif model.provider == ModelProvider.zhipu:
                await AIModelService._test_zhipu(model, api_key)
            elif model.provider == ModelProvider.anthropic:
                await AIModelService._test_anthropic(model, api_key)
            elif model.provider == ModelProvider.stable_diffusion:
                await AIModelService._test_sd(model)
            elif model.provider == ModelProvider.comfyui:
                await AIModelService._test_comfyui(model)
            else:
                return AIModelTestResult(
                    success=False,
                    message=f"暂不支持测试 {model.provider.value} 类型的模型",
                )

            latency = (time.time() - start_time) * 1000
            return AIModelTestResult(
                success=True,
                message="连接成功",
                latency_ms=round(latency, 2),
            )

        except Exception as e:
            latency = (time.time() - start_time) * 1000
            return AIModelTestResult(
                success=False,
                message=f"连接失败: {str(e)}",
                latency_ms=round(latency, 2),
            )

    @staticmethod
    async def _test_openai(model: AIModel, api_key: str):
        """测试 OpenAI/兼容 API 连接"""
        from openai import AsyncOpenAI

        client = AsyncOpenAI(
            api_key=api_key,
            base_url=model.base_url,
            timeout=min(model.timeout, 30),  # 测试使用较短超时
        )

        # 尝试获取模型列表来测试连接
        await client.models.list()

    @staticmethod
    async def _test_zhipu(model: AIModel, api_key: str):
        """测试智谱AI连接"""
        from openai import AsyncOpenAI

        base_url = model.base_url or "https://open.bigmodel.cn/api/paas/v4"
        client = AsyncOpenAI(
            api_key=api_key,
            base_url=base_url,
            timeout=min(model.timeout, 30),
        )

        # 发送一个简单的消息来测试
        await client.chat.completions.create(
            model=model.model_name,
            max_tokens=10,
            messages=[{"role": "user", "content": "Hi"}],
        )

    @staticmethod
    async def _test_anthropic(model: AIModel, api_key: str):
        """测试 Anthropic API 连接"""
        from anthropic import AsyncAnthropic

        client = AsyncAnthropic(
            api_key=api_key,
            base_url=model.base_url,
            timeout=min(model.timeout, 30),
        )

        # 发送一个简单的消息来测试
        await client.messages.create(
            model=model.model_name,
            max_tokens=10,
            messages=[{"role": "user", "content": "Hi"}],
        )

    @staticmethod
    async def _test_sd(model: AIModel):
        """测试 Stable Diffusion WebUI 连接"""
        import httpx

        async with httpx.AsyncClient(timeout=min(model.timeout, 30)) as client:
            response = await client.get(f"{model.base_url}/sdapi/v1/sd-models")
            response.raise_for_status()

    @staticmethod
    async def _test_comfyui(model: AIModel):
        """测试 ComfyUI 连接"""
        import httpx

        async with httpx.AsyncClient(timeout=min(model.timeout, 30)) as client:
            response = await client.get(f"{model.base_url}/system_stats")
            response.raise_for_status()

    @staticmethod
    def _clear_default(db: Session, model_type: ModelType):
        """清除指定类型的默认标记"""
        db.query(AIModel).filter(
            and_(
                AIModel.model_type == model_type,
                AIModel.is_default == True,
            )
        ).update({"is_default": False})

    @staticmethod
    def model_to_response(model: AIModel) -> AIModelResponse:
        """将模型对象转换为响应对象"""
        return AIModelResponse(
            id=model.id,
            name=model.name,
            provider=model.provider,
            model_type=model.model_type,
            model_name=model.model_name,
            base_url=model.base_url,
            api_version=model.api_version,
            organization_id=model.organization_id,
            deployment_name=model.deployment_name,
            has_api_key=bool(model.api_key),
            default_max_tokens=model.default_max_tokens,
            default_temperature=model.default_temperature,
            default_width=model.default_width,
            default_height=model.default_height,
            default_steps=model.default_steps,
            default_cfg_scale=model.default_cfg_scale,
            default_sampler=model.default_sampler,
            checkpoint_name=model.checkpoint_name,
            workflow_template=model.workflow_template,
            timeout=model.timeout,
            extra_headers=model.extra_headers,
            extra_config=model.extra_config,
            is_enabled=model.is_enabled,
            is_default=model.is_default,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )
