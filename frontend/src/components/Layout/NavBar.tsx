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
import {
  NavbarInner,
  NavbarLeft,
  NavbarRight,
  Logo,
  IconBtn,
  MenuIcon,
  UserInfoDisabled,
  UserInfoName,
  UserInfoEmail,
  UserTrigger,
  UserName,
} from './NavBar.styles'

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
        <MenuIcon><IconRobot /></MenuIcon>
        AI 模型管理
      </Menu.Item>
      {user?.role === 'admin' && (
        <Menu.Item key="users">
          <MenuIcon><IconUserGroup /></MenuIcon>
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
        <UserInfoDisabled>
          <UserInfoName>{user?.nickname || user?.username}</UserInfoName>
          <UserInfoEmail>{user?.email}</UserInfoEmail>
        </UserInfoDisabled>
      </Menu.Item>
      <Menu.Item key="profile">
        <MenuIcon><IconUser /></MenuIcon>
        个人设置
      </Menu.Item>
      <Divider style={{ margin: '4px 0' }} />
      <Menu.Item key="logout">
        <MenuIcon><IconPoweroff /></MenuIcon>
        退出登录
      </Menu.Item>
    </Menu>
  )

  const toggleTheme = () => {
    setSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })
  }

  const avatarText = user?.nickname?.[0] || user?.username?.[0] || 'U'

  return (
    <NavbarInner>
      <NavbarLeft>
        <Logo onClick={() => navigate('/')}>
          <IconApps style={{ fontSize: 24, marginRight: 8 }} />
          <Typography.Title heading={5} style={{ margin: 0 }}>
            MAN
          </Typography.Title>
        </Logo>
        
        <Tooltip content={collapsed ? '展开菜单' : '收起菜单'}>
          <IconBtn onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <IconMenuUnfold /> : <IconMenuFold />}
          </IconBtn>
        </Tooltip>
      </NavbarLeft>

      <NavbarRight>
        <Tooltip content={settings.theme === 'light' ? '切换暗色模式' : '切换亮色模式'}>
          <IconBtn onClick={toggleTheme}>
            {settings.theme === 'light' ? <IconMoon /> : <IconSun />}
          </IconBtn>
        </Tooltip>

        <Divider type="vertical" />

        <Dropdown droplist={settingsMenu} position="br">
          <IconBtn>
            <IconSettings style={{ fontSize: 18 }} />
          </IconBtn>
        </Dropdown>

        <Divider type="vertical" />

        <Dropdown droplist={userMenu} position="br">
          <UserTrigger>
            <Avatar size={28} style={{ backgroundColor: '#165DFF' }}>
              {avatarText.toUpperCase()}
            </Avatar>
            <UserName>
              {user?.nickname || user?.username}
            </UserName>
          </UserTrigger>
        </Dropdown>
      </NavbarRight>
    </NavbarInner>
  )
}
