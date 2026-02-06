import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from '@arco-design/web-react'
import zhCN from '@arco-design/web-react/es/locale/zh-CN'
import { GlobalProvider } from './context'
import Layout from './components/Layout'
import AuthGuard, { AdminGuard } from './components/AuthGuard'
import LoginPage from './pages/Login'
import RegisterPage from './pages/Register'
import HomePage from './pages/Home'
import ProjectPage from './pages/Project'
import OutlinePage from './pages/Outline'
import ChaptersPage from './pages/Chapters'
import StoryBiblePage from './pages/StoryBible'
import StoryboardPage from './pages/Storyboard'
import PanelImagesPage from './pages/PanelImages'
import AssetsPage from './pages/Assets'
import PresetsPage from './pages/Presets'
import SettingsPage from './pages/Settings'
import AIModelsPage from './pages/Settings/AIModels'
import UsersPage from './pages/Settings/Users'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <GlobalProvider>
        <BrowserRouter>
          <Routes>
            {/* 公开路由 - 登录/注册 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* 受保护的路由 */}
            <Route
              path="/"
              element={
                <AuthGuard>
                  <Layout />
                </AuthGuard>
              }
            >
              {/* 首页 - 项目列表 */}
              <Route index element={<HomePage />} />

              {/* 预设库 */}
              <Route path="presets" element={<PresetsPage />} />
              <Route path="presets/:type" element={<PresetsPage />} />

              {/* 项目内页面 */}
              <Route path="project/:id" element={<ProjectPage />} />
              <Route path="project/:id/outline" element={<OutlinePage />} />
              <Route path="project/:id/chapters" element={<ChaptersPage />} />
              <Route path="project/:id/story-bible" element={<StoryBiblePage />} />
              <Route path="project/:id/storyboard" element={<StoryboardPage />} />
              <Route path="project/:id/panel-images" element={<PanelImagesPage />} />
              <Route path="project/:id/assets" element={<AssetsPage />} />

              {/* 设置 */}
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/ai-models" element={<AIModelsPage />} />
              <Route
                path="settings/users"
                element={
                  <AdminGuard>
                    <UsersPage />
                  </AdminGuard>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </GlobalProvider>
    </ConfigProvider>
  )
}

export default App
