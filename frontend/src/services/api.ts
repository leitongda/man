import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000, // AI请求可能比较慢
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token 管理
const TOKEN_KEY = 'man-auth-token'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// 请求拦截器 - 自动添加 Token
api.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 401 未认证 - 清除令牌并跳转到登录页
    if (error.response?.status === 401) {
      removeToken()
      localStorage.removeItem('man-auth')
      // 避免在登录页面重复跳转
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login'
      }
    }
    // 统一错误处理
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// 项目相关API
export const projectApi = {
  list: () => api.get('/projects'),
  get: (id: string) => api.get(`/projects/${id}`),
  create: (data: any) => api.post('/projects', data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
}

// Story Bible API
export const storyBibleApi = {
  get: (projectId: string) => api.get(`/projects/${projectId}/story-bible`),
  generate: (projectId: string) => api.post(`/projects/${projectId}/story-bible/generate`),
  update: (projectId: string, data: any) => api.patch(`/projects/${projectId}/story-bible`, data),
}

// 故事大纲API
export const storyApi = {
  getOutline: (projectId: string) => api.get(`/projects/${projectId}/story/outline`),
  updateOutline: (projectId: string, data: any) =>
    api.patch(`/projects/${projectId}/story/outline`, data),
  generate: (projectId: string) =>
    api.post(`/projects/${projectId}/story/generate`),
}

// 章节API
export const chapterApi = {
  list: (projectId: string) => api.get(`/projects/${projectId}/chapters`),
  get: (projectId: string, chapterId: string) => 
    api.get(`/projects/${projectId}/chapters/${chapterId}`),
  create: (projectId: string, data: any) =>
    api.post(`/projects/${projectId}/chapters`, data),
  update: (projectId: string, chapterId: string, data: any) =>
    api.patch(`/projects/${projectId}/chapters/${chapterId}`, data),
  delete: (projectId: string, chapterId: string) =>
    api.delete(`/projects/${projectId}/chapters/${chapterId}`),
  generate: (projectId: string) => api.post(`/projects/${projectId}/chapters/generate`),
}

// 分镜API
export const storyboardApi = {
  get: (projectId: string, chapterId: string) => 
    api.get(`/projects/${projectId}/chapters/${chapterId}/storyboard`),
  listPanels: (projectId: string) =>
    api.get(`/projects/${projectId}/panels`),
  generate: (projectId: string, chapterId: string) => 
    api.post(`/projects/${projectId}/chapters/${chapterId}/storyboard/generate`),
  updatePanel: (projectId: string, panelId: string, data: any) =>
    api.patch(`/projects/${projectId}/panels/${panelId}`, data),
}

// 图像生成API
export const generationApi = {
  generateCharacterSheet: (projectId: string, characterId: string) =>
    api.post(`/projects/${projectId}/characters/${characterId}/generate-sheet`),
  generatePanel: (projectId: string, panelId: string, rough?: boolean) =>
    api.post(`/projects/${projectId}/panels/${panelId}/generate`, { rough }),
  generateBatch: (projectId: string, panelIds: string[], rough?: boolean) =>
    api.post(`/projects/${projectId}/panels/generate-batch`, { panel_ids: panelIds, rough }),
}

// 资产API
export const assetApi = {
  list: (projectId: string, type?: string) => 
    api.get(`/projects/${projectId}/assets`, { params: { type } }),
  upload: (projectId: string, file: File, type: string) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    return api.post(`/projects/${projectId}/assets/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  delete: (projectId: string, assetId: string) =>
    api.delete(`/projects/${projectId}/assets/${assetId}`),
}

// 导出API
export const exportApi = {
  exportChapter: (projectId: string, chapterId: string, format: string) =>
    api.post(`/projects/${projectId}/chapters/${chapterId}/export`, { format }, {
      responseType: 'blob',
    }),
  exportProject: (projectId: string, format: string) =>
    api.post(`/projects/${projectId}/export`, { format }, {
      responseType: 'blob',
    }),
}
