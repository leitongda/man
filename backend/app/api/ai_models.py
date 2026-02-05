"""AI模型管理API"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.ai_model import ModelProvider, ModelType
from app.schemas.ai_model import (
    AIModelCreate,
    AIModelUpdate,
    AIModelResponse,
    AIModelListResponse,
    AIModelTestResult,
    DefaultModelsResponse,
)
from app.services.ai_model_service import AIModelService

router = APIRouter()


@router.get("", response_model=AIModelListResponse)
async def list_models(
    model_type: Optional[ModelType] = None,
    provider: Optional[ModelProvider] = None,
    is_enabled: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    """获取模型列表
    
    Args:
        model_type: 按模型类型筛选
        provider: 按提供商筛选
        is_enabled: 按启用状态筛选
    """
    models = AIModelService.list_models(
        db,
        model_type=model_type,
        provider=provider,
        is_enabled=is_enabled,
    )
    
    return AIModelListResponse(
        items=[AIModelService.model_to_response(m) for m in models],
        total=len(models),
    )


@router.get("/defaults", response_model=DefaultModelsResponse)
async def get_default_models(db: Session = Depends(get_db)):
    """获取各类型的默认模型"""
    defaults = AIModelService.get_all_defaults(db)
    
    return DefaultModelsResponse(
        text_generation=AIModelService.model_to_response(defaults.get("text_generation")) 
            if defaults.get("text_generation") else None,
        image_generation=AIModelService.model_to_response(defaults.get("image_generation")) 
            if defaults.get("image_generation") else None,
        image_analysis=AIModelService.model_to_response(defaults.get("image_analysis")) 
            if defaults.get("image_analysis") else None,
    )


@router.get("/{model_id}", response_model=AIModelResponse)
async def get_model(model_id: str, db: Session = Depends(get_db)):
    """获取模型详情"""
    model = AIModelService.get_model(db, model_id)
    if not model:
        raise HTTPException(status_code=404, detail="模型配置不存在")
    
    return AIModelService.model_to_response(model)


@router.post("", response_model=AIModelResponse, status_code=201)
async def create_model(data: AIModelCreate, db: Session = Depends(get_db)):
    """创建模型配置"""
    try:
        model = AIModelService.create_model(db, data)
        return AIModelService.model_to_response(model)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.patch("/{model_id}", response_model=AIModelResponse)
async def update_model(
    model_id: str,
    data: AIModelUpdate,
    db: Session = Depends(get_db),
):
    """更新模型配置"""
    try:
        model = AIModelService.update_model(db, model_id, data)
        return AIModelService.model_to_response(model)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{model_id}")
async def delete_model(model_id: str, db: Session = Depends(get_db)):
    """删除模型配置"""
    success = AIModelService.delete_model(db, model_id)
    if not success:
        raise HTTPException(status_code=404, detail="模型配置不存在")
    
    return {"status": "deleted", "id": model_id}


@router.post("/{model_id}/test", response_model=AIModelTestResult)
async def test_model(model_id: str, db: Session = Depends(get_db)):
    """测试模型连接"""
    try:
        result = await AIModelService.test_connection(db, model_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/{model_id}/set-default", response_model=AIModelResponse)
async def set_default_model(model_id: str, db: Session = Depends(get_db)):
    """设置为默认模型"""
    try:
        model = AIModelService.set_default_model(db, model_id)
        return AIModelService.model_to_response(model)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/providers/list")
async def list_providers():
    """获取支持的提供商列表"""
    return {
        "providers": [
            {
                "value": p.value,
                "label": {
                    "openai": "OpenAI",
                    "openai_compatible": "OpenAI 兼容 (Azure/Ollama/vLLM)",
                    "anthropic": "Anthropic Claude",
                    "stable_diffusion": "Stable Diffusion WebUI",
                    "comfyui": "ComfyUI",
                    "midjourney": "Midjourney",
                }.get(p.value, p.value),
                "supported_types": _get_supported_types(p),
            }
            for p in ModelProvider
        ]
    }


@router.get("/types/list")
async def list_model_types():
    """获取支持的模型类型列表"""
    return {
        "types": [
            {
                "value": t.value,
                "label": {
                    "text_generation": "文本生成",
                    "image_generation": "图像生成",
                    "image_analysis": "图像分析",
                }.get(t.value, t.value),
            }
            for t in ModelType
        ]
    }


def _get_supported_types(provider: ModelProvider) -> List[str]:
    """获取提供商支持的模型类型"""
    mapping = {
        ModelProvider.openai: ["text_generation", "image_generation", "image_analysis"],
        ModelProvider.openai_compatible: ["text_generation", "image_analysis"],
        ModelProvider.anthropic: ["text_generation", "image_analysis"],
        ModelProvider.stable_diffusion: ["image_generation"],
        ModelProvider.comfyui: ["image_generation"],
        ModelProvider.midjourney: ["image_generation"],
    }
    return mapping.get(provider, [])
