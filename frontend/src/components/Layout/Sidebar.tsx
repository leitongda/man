/**
 * 侧边栏组件 - Arco Pro 风格
 */
import { Menu } from '@arco-design/web-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { homeRoutes, projectRoutes, settingsRoutes, IRoute } from '@/routes'
import { useGlobalContext } from '@/context'
import styles from './layout.module.css'

interface SidebarProps {
  projectId?: string
}

export default function Sidebar({ projectId }: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { collapsed } = useGlobalContext()

  // 根据当前路径判断使用哪组菜单
  const isInProject = location.pathname.startsWith('/project/')
  const isInSettings = location.pathname.startsWith('/settings')

  // 选择对应的路由配置
  let routes: IRoute[]
  if (isInProject && projectId) {
    routes = projectRoutes
  } else if (isInSettings) {
    routes = settingsRoutes
  } else {
    routes = homeRoutes
  }

  // 处理路径中的动态参数
  const getActualPath = (path: string | undefined) => {
    if (!path) return ''
    if (projectId) {
      return path.replace(':id', projectId)
    }
    return path
  }

  // 获取当前选中的菜单项
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

  // 获取默认展开的子菜单
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

  // 渲染菜单项
  const renderMenuItems = (routes: IRoute[]) => {
    return routes
      .filter((route) => !route.ignore)
      .map((route) => {
        const IconComponent = route.icon as React.ComponentType<any>
        const icon = IconComponent ? <IconComponent className={styles.menuIcon} /> : null

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

  // 处理菜单点击
  const handleMenuClick = (key: string) => {
    // 查找对应的路由
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
    <div className={styles.menuWrapper}>
      <Menu
        collapse={collapsed}
        selectedKeys={getSelectedKeys()}
        defaultOpenKeys={getOpenKeys()}
        onClickMenuItem={handleMenuClick}
        style={{ width: '100%', height: '100%' }}
      >
        {renderMenuItems(routes)}
      </Menu>
    </div>
  )
}
