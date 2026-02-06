// 预设类型
export type PresetType = 'character' | 'world' | 'style' | 'scene' | 'storyboard'

// 预设
export interface Preset {
  id: string
  owner_id?: string
  type: PresetType
  name: string
  description?: string
  data: Record<string, any>
  is_public: boolean
  created_at: string
  updated_at: string
}

// 预设列表响应
export interface PresetListResponse {
  items: Preset[]
  total: number
}

// 创建预设
export interface PresetCreate {
  type: PresetType
  name: string
  description?: string
  data: Record<string, any>
  is_public?: boolean
}

// 更新预设
export interface PresetUpdate {
  name?: string
  description?: string
  data?: Record<string, any>
  is_public?: boolean
}

// 预设类型中文映射
export const presetTypeLabels: Record<PresetType, string> = {
  character: '角色',
  world: '世界观',
  style: '风格',
  scene: '场景',
  storyboard: '分镜',
}

// URL slug 到 type 的映射
export const presetSlugToType: Record<string, PresetType> = {
  characters: 'character',
  worlds: 'world',
  styles: 'style',
  scenes: 'scene',
  storyboards: 'storyboard',
}

export const presetTypeToSlug: Record<PresetType, string> = {
  character: 'characters',
  world: 'worlds',
  style: 'styles',
  scene: 'scenes',
  storyboard: 'storyboards',
}
