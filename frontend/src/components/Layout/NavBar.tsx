/**
 * 导航栏组件 - Arco Pro 风格
 */
import { Menu, Dropdown, Typography, Divider, Tooltip, Avatar, Message } from '@arco-design/web-react'
import {
  IconApps,
  IconSettings,
  IconRobot,
  IconSun,
  IconMoon,
  IconMenuFold,
  IconMenuUnfold,
  IconUser,
  IconPoweroff,
  IconUserGroup,
} from '@arco-design/web-react/icon'
import { useNavigate } from 'react-router-dom'
import { useGlobalContext } from '@/context'
import { useAuthStore } from '@/stores/auth'
import styles from './layout.module.css'

export default function NavBar() {
  const navigate = useNavigate()
  const { settings, setSettings, collapsed, setCollapsed } = useGlobalContext()
  const { user, logout } = useAuthStore()

  const settingsMenu = (
    <Menu
      onClickMenuItem={(key) => {
        if (key === 'ai-models') {
          navigate('/settings/ai-models')
        } else if (key === 'users') {
          navigate('/settings/users')
        }
      }}
    >
      <Menu.Item key="ai-models">
        <IconRobot style={{ marginRight: 8 }} />
        AI 模型管理
      </Menu.Item>
      {user?.role === 'admin' && (
        <Menu.Item key="users">
          <IconUserGroup style={{ marginRight: 8 }} />
          用户管理
        </Menu.Item>
      )}
    </Menu>
  )

  const userMenu = (
    <Menu
      onClickMenuItem={(key) => {
        if (key === 'profile') {
          navigate('/settings')
        } else if (key === 'logout') {
          logout()
          Message.success('已退出登录')
          navigate('/login')
        }
      }}
    >
      <Menu.Item key="info" disabled>
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 500 }}>{user?.nickname || user?.username}</div>
          <div style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{user?.email}</div>
        </div>
      </Menu.Item>
      <Menu.Item key="profile">
        <IconUser style={{ marginRight: 8 }} />
        个人设置
      </Menu.Item>
      <Divider style={{ margin: '4px 0' }} />
      <Menu.Item key="logout">
        <IconPoweroff style={{ marginRight: 8 }} />
        退出登录
      </Menu.Item>
    </Menu>
  )

  const toggleTheme = () => {
    setSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })
  }

  // 用户名首字母
  const avatarText = user?.nickname?.[0] || user?.username?.[0] || 'U'

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

        <Divider type="vertical" />

        {/* 用户头像和下拉菜单 */}
        <Dropdown droplist={userMenu} position="br">
          <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: 8 }}>
            <Avatar size={28} style={{ backgroundColor: '#165DFF' }}>
              {avatarText.toUpperCase()}
            </Avatar>
            <span style={{ fontSize: 14, color: 'var(--color-text-1)' }}>
              {user?.nickname || user?.username}
            </span>
          </div>
        </Dropdown>
      </div>
    </div>
  )
}
