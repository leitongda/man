/**
 * 全局上下文 - Arco Pro 风格
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface Settings {
  // 是否显示导航栏
  navbar: boolean
  // 是否显示侧边栏
  menu: boolean
  // 是否显示页脚
  footer: boolean
  // 侧边栏宽度
  menuWidth: number
  // 主题
  theme: 'light' | 'dark'
  // 颜色弱化
  colorWeak: boolean
}

export const defaultSettings: Settings = {
  navbar: true,
  menu: true,
  footer: false,
  menuWidth: 220,
  theme: 'light',
  colorWeak: false,
}

interface GlobalContextType {
  settings: Settings
  setSettings: (settings: Partial<Settings>) => void
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

const GlobalContext = createContext<GlobalContextType>({
  settings: defaultSettings,
  setSettings: () => {},
  collapsed: false,
  setCollapsed: () => {},
})

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [settings, setSettingsState] = useState<Settings>(() => {
    const saved = localStorage.getItem('app-settings')
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) }
      } catch {
        return defaultSettings
      }
    }
    return defaultSettings
  })

  const [collapsed, setCollapsed] = useState(false)

  const setSettings = (newSettings: Partial<Settings>) => {
    setSettingsState((prev) => {
      const updated = { ...prev, ...newSettings }
      localStorage.setItem('app-settings', JSON.stringify(updated))
      return updated
    })
  }

  // 应用主题
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.body.setAttribute('arco-theme', 'dark')
    } else {
      document.body.removeAttribute('arco-theme')
    }
  }, [settings.theme])

  // 应用颜色弱化
  useEffect(() => {
    if (settings.colorWeak) {
      document.body.style.filter = 'invert(80%)'
    } else {
      document.body.style.filter = ''
    }
  }, [settings.colorWeak])

  return (
    <GlobalContext.Provider value={{ settings, setSettings, collapsed, setCollapsed }}>
      {children}
    </GlobalContext.Provider>
  )
}

export function useGlobalContext() {
  return useContext(GlobalContext)
}

export default GlobalContext
