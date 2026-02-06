import { api } from './api'
import type { LoginRequest, RegisterRequest, TokenResponse, User, UserListResponse, UserUpdateByAdmin } from '@/types/user'

// 认证API
export const authApi = {
  register: (data: RegisterRequest): Promise<TokenResponse> =>
    api.post('/auth/register', data),

  login: (data: LoginRequest): Promise<TokenResponse> =>
    api.post('/auth/login', data),

  getMe: (): Promise<User> =>
    api.get('/auth/me'),

  updateMe: (data: Partial<Pick<User, 'nickname' | 'email' | 'avatar'>>): Promise<User> =>
    api.patch('/auth/me', data),

  changePassword: (old_password: string, new_password: string): Promise<{ message: string }> =>
    api.post('/auth/change-password', { old_password, new_password }),
}

// 用户管理API（管理员）
export const userApi = {
  list: (params?: { page?: number; page_size?: number; keyword?: string; role?: string; is_active?: boolean }): Promise<UserListResponse> =>
    api.get('/users', { params }),

  get: (userId: string): Promise<User> =>
    api.get(`/users/${userId}`),

  update: (userId: string, data: UserUpdateByAdmin): Promise<User> =>
    api.patch(`/users/${userId}`, data),

  delete: (userId: string): Promise<{ message: string }> =>
    api.delete(`/users/${userId}`),

  resetPassword: (userId: string): Promise<{ message: string }> =>
    api.post(`/users/${userId}/reset-password`),
}
