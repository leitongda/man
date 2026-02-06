import { create } from 'zustand'
import { projectApi } from '@/services/api'
import type { Project, ProjectConfig } from '@/types/project'

interface ProjectState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  
  // Actions
  fetchProjects: () => Promise<void>
  createProject: (name: string, description: string, config: Partial<ProjectConfig>) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
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
  (set, get) => ({
    projects: [],
    currentProject: null,
    loading: false,

    fetchProjects: async () => {
      set({ loading: true })
      try {
        const projects = await projectApi.list() as any as Project[]
        set({ projects, loading: false })
      } catch (error) {
        console.error('Failed to fetch projects:', error)
        set({ loading: false })
      }
    },

    createProject: async (name, description, config) => {
      const data = {
        name,
        description,
        config: { ...defaultConfig, ...config },
      }
      
      const newProject = await projectApi.create(data) as any as Project
      
      set((state) => ({
        projects: [newProject, ...state.projects],
      }))
      
      return newProject
    },

    updateProject: async (id, updates) => {
      const updatedProject = await projectApi.update(id, updates) as any as Project
      
      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === id ? updatedProject : p
        ),
        currentProject: state.currentProject?.id === id ? updatedProject : state.currentProject,
      }))
    },

    deleteProject: async (id) => {
      await projectApi.delete(id)
      
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }))
    },

    setCurrentProject: (project) => {
      set({ currentProject: project })
    },

    getProject: (id) => {
      return get().projects.find((p) => p.id === id)
    },
  })
)
