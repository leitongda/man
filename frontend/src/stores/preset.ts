import { create } from 'zustand'
import { presetApi } from '@/services/preset'
import type { Preset, PresetType, PresetCreate, PresetUpdate } from '@/types/preset'

interface PresetState {
  presets: Preset[]
  loading: boolean
  total: number

  // Actions
  fetchPresets: (params?: { type?: PresetType; scope?: 'private' | 'public' | 'all'; keyword?: string }) => Promise<void>
  createPreset: (data: PresetCreate) => Promise<Preset>
  updatePreset: (id: string, data: PresetUpdate) => Promise<void>
  deletePreset: (id: string) => Promise<void>
}

export const usePresetStore = create<PresetState>()(
  (set) => ({
    presets: [],
    loading: false,
    total: 0,

    fetchPresets: async (params) => {
      set({ loading: true })
      try {
        const res = await presetApi.list(params)
        set({ presets: res.items, total: res.total, loading: false })
      } catch (error) {
        console.error('Failed to fetch presets:', error)
        set({ loading: false })
      }
    },

    createPreset: async (data) => {
      const preset = await presetApi.create(data)
      set((state) => ({
        presets: [preset, ...state.presets],
        total: state.total + 1,
      }))
      return preset
    },

    updatePreset: async (id, data) => {
      const updated = await presetApi.update(id, data)
      set((state) => ({
        presets: state.presets.map((p) => (p.id === id ? updated : p)),
      }))
    },

    deletePreset: async (id) => {
      await presetApi.delete(id)
      set((state) => ({
        presets: state.presets.filter((p) => p.id !== id),
        total: state.total - 1,
      }))
    },
  })
)
