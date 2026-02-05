/**
 * AI 模型管理 API 服务
 */

import { api } from './api'

// 模型提供商枚举
export type ModelProvider = 
  | 'openai' 
  | 'openai_compatible' 
  | 'anthropic' 
  | 'stable_diffusion' 
  | 'comfyui' 
  | 'midjourney'

// 模型类型枚举
export type ModelType = 'text_generation' | 'image_generation' | 'image_analysis'

// 模型配置接口
export interface AIModel {
  id: string
  name: string
  provider: ModelProvider
  model_type: ModelType
  model_name: string
  
  // 连接配置
  base_url?: string
  api_version?: string
  organization_id?: string
  deployment_name?: string
  has_api_key: boolean
  
  // 文本生成配置
  default_max_tokens?: number
  default_temperature?: number
  
  // 图像生成配置
  default_width?: number
  default_height?: number
  default_steps?: number
  default_cfg_scale?: number
  default_sampler?: string
  checkpoint_name?: string
  workflow_template?: string
  
  // 通用配置
  timeout: number
  extra_headers?: Record<string, string>
  extra_config?: Record<string, any>
  
  is_enabled: boolean
  is_default: boolean
  created_at: string
  updated_at: string
}

// 创建模型配置请求
export interface AIModelCreateRequest {
  name: string
  provider: ModelProvider
  model_type: ModelType
  model_name: string
  
  api_key?: string
  base_url?: string
  api_version?: string
  organization_id?: string
  deployment_name?: string
  
  default_max_tokens?: number
  default_temperature?: number
  
  default_width?: number
  default_height?: number
  default_steps?: number
  default_cfg_scale?: number
  default_sampler?: string
  checkpoint_name?: string
  workflow_template?: string
  
  timeout?: number
  extra_headers?: Record<string, string>
  extra_config?: Record<string, any>
  
  is_enabled?: boolean
  is_default?: boolean
}

// 更新模型配置请求
export interface AIModelUpdateRequest {
  name?: string
  model_name?: string
  api_key?: string
  base_url?: string
  api_version?: string
  organization_id?: string
  deployment_name?: string
  
  default_max_tokens?: number
  default_temperature?: number
  
  default_width?: number
  default_height?: number
  default_steps?: number
  default_cfg_scale?: number
  default_sampler?: string
  checkpoint_name?: string
  workflow_template?: string
  
  timeout?: number
  extra_headers?: Record<string, string>
  extra_config?: Record<string, any>
  
  is_enabled?: boolean
  is_default?: boolean
}

// 模型列表响应
export interface AIModelListResponse {
  items: AIModel[]
  total: number
}

// 默认模型响应
export interface DefaultModelsResponse {
  text_generation?: AIModel
  image_generation?: AIModel
  image_analysis?: AIModel
}

// 连接测试结果
export interface AIModelTestResult {
  success: boolean
  message: string
  latency_ms?: number
}

// 提供商信息
export interface ProviderInfo {
  value: ModelProvider
  label: string
  supported_types: ModelType[]
}

// 模型类型信息
export interface ModelTypeInfo {
  value: ModelType
  label: string
}

/**
 * AI 模型管理 API
 */
export const aiModelApi = {
  /**
   * 获取模型列表
   */
  list: (params?: {
    model_type?: ModelType
    provider?: ModelProvider
    is_enabled?: boolean
  }): Promise<AIModelListResponse> => 
    api.get('/ai-models', { params }),

  /**
   * 获取各类型的默认模型
   */
  getDefaults: (): Promise<DefaultModelsResponse> => 
    api.get('/ai-models/defaults'),

  /**
   * 获取模型详情
   */
  get: (id: string): Promise<AIModel> => 
    api.get(`/ai-models/${id}`),

  /**
   * 创建模型配置
   */
  create: (data: AIModelCreateRequest): Promise<AIModel> => 
    api.post('/ai-models', data),

  /**
   * 更新模型配置
   */
  update: (id: string, data: AIModelUpdateRequest): Promise<AIModel> => 
    api.patch(`/ai-models/${id}`, data),

  /**
   * 删除模型配置
   */
  delete: (id: string): Promise<{ status: string; id: string }> => 
    api.delete(`/ai-models/${id}`),

  /**
   * 测试模型连接
   */
  test: (id: string): Promise<AIModelTestResult> => 
    api.post(`/ai-models/${id}/test`),

  /**
   * 设置为默认模型
   */
  setDefault: (id: string): Promise<AIModel> => 
    api.post(`/ai-models/${id}/set-default`),

  /**
   * 获取支持的提供商列表
   */
  getProviders: (): Promise<{ providers: ProviderInfo[] }> => 
    api.get('/ai-models/providers/list'),

  /**
   * 获取支持的模型类型列表
   */
  getModelTypes: (): Promise<{ types: ModelTypeInfo[] }> => 
    api.get('/ai-models/types/list'),
}

/**
 * 提供商显示名称映射
 */
export const providerLabels: Record<ModelProvider, string> = {
  openai: 'OpenAI',
  openai_compatible: 'OpenAI 兼容 (Azure/Ollama/vLLM)',
  anthropic: 'Anthropic Claude',
  stable_diffusion: 'Stable Diffusion WebUI',
  comfyui: 'ComfyUI',
  midjourney: 'Midjourney',
}

/**
 * 模型类型显示名称映射
 */
export const modelTypeLabels: Record<ModelType, string> = {
  text_generation: '文本生成',
  image_generation: '图像生成',
  image_analysis: '图像分析',
}

/**
 * 根据提供商获取需要的配置字段
 */
export const getFieldsByProvider = (provider: ModelProvider): string[] => {
  const common = ['name', 'model_name', 'timeout']
  
  switch (provider) {
    case 'openai':
      return [...common, 'api_key', 'base_url', 'organization_id']
    case 'openai_compatible':
      return [...common, 'api_key', 'base_url', 'api_version', 'deployment_name', 'extra_headers']
    case 'anthropic':
      return [...common, 'api_key', 'base_url', 'api_version']
    case 'stable_diffusion':
      return [...common, 'base_url', 'checkpoint_name', 'default_sampler', 
              'default_steps', 'default_cfg_scale', 'default_width', 'default_height']
    case 'comfyui':
      return [...common, 'base_url', 'workflow_template']
    case 'midjourney':
      return [...common, 'api_key', 'base_url']
    default:
      return common
  }
}

/**
 * 根据提供商获取支持的模型类型
 */
export const getSupportedTypesByProvider = (provider: ModelProvider): ModelType[] => {
  switch (provider) {
    case 'openai':
      return ['text_generation', 'image_generation', 'image_analysis']
    case 'openai_compatible':
    case 'anthropic':
      return ['text_generation', 'image_analysis']
    case 'stable_diffusion':
    case 'comfyui':
    case 'midjourney':
      return ['image_generation']
    default:
      return []
  }
}
