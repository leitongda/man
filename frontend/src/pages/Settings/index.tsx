/**
 * 设置页面入口
 */

import { Navigate } from 'react-router-dom'

export default function SettingsPage() {
  // 默认重定向到 AI 模型管理页面
  return <Navigate to="/settings/ai-models" replace />
}
