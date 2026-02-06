/**
 * 导航栏组件 - Arco Pro 风格
 */
import { Menu, Dropdown, Typography, Switch, Divider, Tooltip } from '@arco-design/web-react'
import {
  IconApps,
  IconSettings,
  IconRobot,
  IconSun,
  IconMoon,
  IconMenuFold,
  IconMenuUnfold,
} from '@arco-design/web-react/icon'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '@/context'
import styles from './layout.module.css'

export default function NavBar() {
  const navigate = useNavigate()
  const { settings, setSettings, collapsed, setCollapsed } = useGlobalContext()

  const settingsMenu = (
    <Menu
      onClickMenuItem={(key) => {
        if (key === 'ai-models') {
          navigate('/settings/ai-models')
        }
      }}
    >
      <Menu.Item key="ai-models">
        <IconRobot style={{ marginRight: 8 }} />
        AI 模型管理
      </Menu.Item>
    </Menu>
  )

  const toggleTheme = () => {
    setSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })
  }

  return (
    <div className={styles.navbarInner}>
      {/* 左侧 Logo 和折叠按钮 */}
      <div className={styles.navbarLeft}>
        <div className={styles.logo} onClick={() => navigate('/')}>
          <IconApps style={{ fontSize: 24, marginRight: 8 }} />
          <Typography.Title heading={5} style={{ margin: 0 }}>
            MAN
          </Typography.Title>
        </div>
        
        <Tooltip content={collapsed ? '展开菜单' : '收起菜单'}>
          <div className={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
          </div>
        </Tooltip>
      </div>

      {/* 右侧操作区 */}
      <div className={styles.navbarRight}>
        {/* 主题切换 */}
        <Tooltip content={settings.theme === 'light' ? '切换暗色模式' : '切换亮色模式'}>
          <div className={styles.navbarBtn} onClick={toggleTheme}>
            {settings.theme === 'light' ? <IconMoon /> : <IconSun />}
          </div>
        </Tooltip>

        <Divider type="vertical" />

        {/* 设置菜单 */}
        <Dropdown droplist={settingsMenu} position="br">
          <div className={styles.navbarBtn}>
            <IconSettings style={{ fontSize: 18 }} />
          </div>
        </Dropdown>
      </div>
    </div>
  )
}
