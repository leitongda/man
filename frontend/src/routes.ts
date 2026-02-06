/**
 * Arco Pro 风格的路由配置
 */
import {
  IconHome,
  IconBook,
  IconImage,
  IconFolder,
  IconApps,
  IconSettings,
  IconRobot,
  IconFile,
} from '@arco-design/web-react/icon'
import type { ReactNode } from 'react'

export interface IRoute {
  name: string
  key: string
  path?: string
  icon?: ReactNode
  breadcrumb?: boolean
  children?: IRoute[]
  // 不在菜单中显示，但可以通过路由访问
  ignore?: boolean
  // 是否需要项目 ID 参数
  requireProjectId?: boolean
}

// 首页菜单（未进入项目时）
export const homeRoutes: IRoute[] = [
  {
    name: '首页',
    key: 'home',
    path: '/',
    icon: IconHome,
  },
  {
    name: '项目列表',
    key: 'projects',
    path: '/projects',
    icon: IconFile,
    ignore: true, // 首页已包含项目列表
  },
]

// 项目内菜单
export const projectRoutes: IRoute[] = [
  {
    name: '项目概览',
    key: 'project-overview',
    path: '/project/:id',
    icon: IconHome,
  },
  {
    name: '世界观',
    key: 'story-bible',
    path: '/project/:id/story-bible',
    icon: IconBook,
  },
  {
    name: '分镜',
    key: 'storyboard',
    path: '/project/:id/storyboard',
    icon: IconImage,
  },
  {
    name: '资产',
    key: 'assets',
    path: '/project/:id/assets',
    icon: IconFolder,
  },
  {
    name: '工作流',
    key: 'workflow',
    path: '/project/:id/workflow',
    icon: IconApps,
  },
]

// 设置菜单
export const settingsRoutes: IRoute[] = [
  {
    name: '设置',
    key: 'settings',
    path: '/settings',
    icon: IconSettings,
    children: [
      {
        name: 'AI 模型管理',
        key: 'ai-models',
        path: '/settings/ai-models',
        icon: IconRobot,
      },
    ],
  },
]

// 获取当前路由对应的菜单项
export function getRouteByPath(path: string, routes: IRoute[]): IRoute | undefined {
  for (const route of routes) {
    if (route.path === path) {
      return route
    }
    if (route.children) {
      const found = getRouteByPath(path, route.children)
      if (found) return found
    }
  }
  return undefined
}

// 根据路径获取面包屑
export function getBreadcrumb(path: string, routes: IRoute[]): string[] {
  const breadcrumb: string[] = []
  
  function find(routes: IRoute[], parents: string[] = []): boolean {
    for (const route of routes) {
      const currentPath = [...parents, route.name]
      if (route.path === path) {
        breadcrumb.push(...currentPath)
        return true
      }
      if (route.children && find(route.children, currentPath)) {
        return true
      }
    }
    return false
  }
  
  find(routes)
  return breadcrumb
}
