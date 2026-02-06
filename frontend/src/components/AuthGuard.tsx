/**
 * 路由守卫 - 保护需要认证的页面
 */
import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Spin } from '@arco-design/web-react'
import { useAuthStore } from '@/stores/auth'
import { getToken } from '@/services/api'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation()
  const { isLoggedIn, loading, fetchMe, user } = useAuthStore()
  const token = getToken()

  useEffect(() => {
    // 如果有 token 但没有用户信息，尝试获取
    if (token && !user) {
      fetchMe()
    }
  }, [token, user, fetchMe])

  // 没有 token，重定向到登录页
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 正在加载用户信息
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <Spin size={40} />
      </div>
    )
  }

  return <>{children}</>
}

/**
 * 管理员路由守卫
 */
interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user } = useAuthStore()

  if (user && user.role !== 'admin') {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '60vh',
        color: 'var(--color-text-3)',
        fontSize: 16,
      }}>
        权限不足，需要管理员权限
      </div>
    )
  }

  return <>{children}</>
}
