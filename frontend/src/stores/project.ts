import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project, ProjectConfig } from '@/types/project'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  
  // Actions
  createProject: (name: string, description: string, config: Partial<ProjectConfig>) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setCurrentProject: (project: Project | null) => void
  getProject: (id: string) => Project | undefined
}

const defaultConfig: ProjectConfig = {
  style: 'manga',
  format: 'webtoon_vertical',
  panels_per_chapter: 12,
  max_characters: 5,
  content_rating: 'all_ages',
  tone: 'comedy',
  language: 'zh-CN',
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,

      createProject: async (name, description, config) => {
        const newProject: Project = {
          id: crypto.randomUUID(),
          name,
          description,
          config: { ...defaultConfig, ...config },
          status: 'draft',
          current_step: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        
        set((state) => ({
          projects: [...state.projects, newProject],
        }))
        
        return newProject
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString() } : p
          ),
        }))
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }))
      },

      setCurrentProject: (project) => {
        set({ currentProject: project })
      },

      getProject: (id) => {
        return get().projects.find((p) => p.id === id)
      },
    }),
    {
      name: 'man-projects',
    }
  )
)
