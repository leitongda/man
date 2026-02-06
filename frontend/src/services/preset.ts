import { api } from './api'
import type { PresetListResponse, Preset, PresetCreate, PresetUpdate } from '@/types/preset'

export const presetApi = {
  list: (params?: {
    type?: string
    scope?: 'private' | 'public' | 'all'
    keyword?: string
  }): Promise<PresetListResponse> =>
    api.get('/presets', { params }),

  get: (id: string): Promise<Preset> =>
    api.get(`/presets/${id}`),

  create: (data: PresetCreate): Promise<Preset> =>
    api.post('/presets', data),

  update: (id: string, data: PresetUpdate): Promise<Preset> =>
    api.patch(`/presets/${id}`, data),

  delete: (id: string): Promise<{ message: string }> =>
    api.delete(`/presets/${id}`),

  importToProject: (presetId: string, projectId: string): Promise<{ message: string }> =>
    api.post(`/presets/${presetId}/import-to-project/${projectId}`),
}
