// 用户信息
export interface User {
  id: string
  username: string
  email: string
  nickname?: string
  avatar?: string
  role: 'admin' | 'user'
  is_active: boolean
  last_login_at?: string
  created_at: string
  updated_at: string
}

// 登录请求
export interface LoginRequest {
  username: string
  password: string
}

// 注册请求
export interface RegisterRequest {
  username: string
  email: string
  password: string
  nickname?: string
}

// 令牌响应
export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

// 用户列表响应
export interface UserListResponse {
  items: User[]
  total: number
  page: number
  page_size: number
}

// 更新用户（管理员）
export interface UserUpdateByAdmin {
  nickname?: string
  email?: string
  role?: 'admin' | 'user'
  is_active?: boolean
}
