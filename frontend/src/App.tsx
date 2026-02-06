import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ConfigProvider } from '@arco-design/web-react'
import zhCN from '@arco-design/web-react/es/locale/zh-CN'
import { GlobalProvider } from './context'
import Layout from './components/Layout'
import HomePage from './pages/Home'
import ProjectPage from './pages/Project'
import StoryBiblePage from './pages/StoryBible'
import StoryboardPage from './pages/Storyboard'
import AssetsPage from './pages/Assets'
import WorkflowPage from './pages/Workflow'
import SettingsPage from './pages/Settings'
import AIModelsPage from './pages/Settings/AIModels'

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <GlobalProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="project/:id" element={<ProjectPage />} />
              <Route path="project/:id/story-bible" element={<StoryBiblePage />} />
              <Route path="project/:id/storyboard" element={<StoryboardPage />} />
              <Route path="project/:id/assets" element={<AssetsPage />} />
              <Route path="project/:id/workflow" element={<WorkflowPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="settings/ai-models" element={<AIModelsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </GlobalProvider>
    </ConfigProvider>
  )
}

export default App
