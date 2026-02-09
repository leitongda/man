/**
 * 侧边栏组件 - Arco Pro 风格
 */
import { Menu } from '@arco-design/web-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { homeRoutes, projectRoutes, settingsRoutes, IRoute } from '@/routes'
import { useGlobalContext } from '@/context'
import { MenuWrapper, StyledMenuIcon } from './Sidebar.styles'

interface SidebarProps {
  projectId?: string
}

export default function Sidebar({ projectId }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { collapsed } = useGlobalContext()

  const isInProject = location.pathname.startsWith('/project/')
  const isInSettings = location.pathname.startsWith('/settings')

  let routes: IRoute[]
  if (isInProject && projectId) {
    routes = projectRoutes
  } else if (isInSettings) {
    routes = settingsRoutes
  } else {
    routes = homeRoutes
  }

  const getActualPath = (path: string | undefined) => {
    if (!path) return ''
    if (projectId) {
      return path.replace(':id', projectId)
    }
    return path
  }

  const getSelectedKeys = () => {
    const currentPath = location.pathname
    for (const route of routes) {
      const actualPath = getActualPath(route.path)
      if (actualPath === currentPath) {
        return [route.key]
      }
      if (route.children) {
        for (const child of route.children) {
          const childPath = getActualPath(child.path)
          if (childPath === currentPath) {
            return [child.key]
          }
        }
      }
    }
    return []
  }

  const getOpenKeys = () => {
    const keys: string[] = []
    for (const route of routes) {
      if (route.children) {
        for (const child of route.children) {
          const childPath = getActualPath(child.path)
          if (location.pathname.startsWith(childPath || '')) {
            keys.push(route.key)
          }
        }
      }
    }
    return keys
  }

  const renderMenuItems = (routes: IRoute[]) => {
    return routes
      .filter((route) => !route.ignore)
      .map((route) => {
        const IconComponent = route.icon as unknown as React.ComponentType<any>
        const icon = IconComponent ? (
          <StyledMenuIcon><IconComponent /></StyledMenuIcon>
        ) : null

        if (route.children && route.children.length > 0) {
          return (
            <Menu.SubMenu
              key={route.key}
              title={
                <>
                  {icon}
                  {route.name}
                </>
              }
            >
              {renderMenuItems(route.children)}
            </Menu.SubMenu>
          )
        }

        return (
          <Menu.Item key={route.key}>
            {icon}
            {route.name}
          </Menu.Item>
        )
      })
  }

  const handleMenuClick = (key: string) => {
    const findRoute = (routes: IRoute[]): IRoute | undefined => {
      for (const route of routes) {
        if (route.key === key) return route
        if (route.children) {
          const found = findRoute(route.children)
          if (found) return found
        }
      }
      return undefined
    }

    const route = findRoute(routes)
    if (route?.path) {
      const actualPath = getActualPath(route.path)
      navigate(actualPath)
    }
  }

  return (
    <MenuWrapper>
      <Menu
        collapse={collapsed}
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        onClickMenuItem={handleMenuClick}
        style={{ width: '100%', height: '100%' }}
      >
        {renderMenuItems(routes)}
      </Menu>
    </MenuWrapper>
  )
}
