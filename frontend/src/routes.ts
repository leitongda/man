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
  IconUserGroup,
  IconBrush,
  IconEdit,
  IconList,
  IconCamera,
  IconCommon,
  IconStorage,
} from '@arco-design/web-react/icon'
import type { ReactNode } from 'react'

export interface IRoute {
  name: string
  key: string
  path?: string
  icon?: ReactNode
  breadcrumb?: boolean
  children?: IRoute[]
  ignore?: boolean
  requireProjectId?: boolean
}

// 首页菜单（未进入项目时）
export const homeRoutes: IRoute[] = [
  {
    name: '项目列表',
    key: 'home',
    path: '/',
    icon: IconHome,
  },
  {
    name: '预设库',
    key: 'presets',
    path: '/presets',
    icon: IconStorage,
    children: [
      {
        name: '角色预设',
        key: 'presets-characters',
        path: '/presets/characters',
        icon: IconUserGroup,
      },
      {
        name: '世界观预设',
        key: 'presets-worlds',
        path: '/presets/worlds',
        icon: IconCommon,
      },
      {
        name: '风格预设',
        key: 'presets-styles',
        path: '/presets/styles',
        icon: IconBrush,
      },
      {
        name: '场景预设',
        key: 'presets-scenes',
        path: '/presets/scenes',
        icon: IconImage,
      },
      {
        name: '分镜预设',
        key: 'presets-storyboards',
        path: '/presets/storyboards',
        icon: IconCamera,
      },
    ],
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
    name: '大纲/故事线',
    key: 'outline',
    path: '/project/:id/outline',
    icon: IconEdit,
  },
  {
    name: '章节管理',
    key: 'chapters',
    path: '/project/:id/chapters',
    icon: IconList,
  },
  {
    name: '世界观',
    key: 'story-bible',
    path: '/project/:id/story-bible',
    icon: IconBook,
  },
  {
    name: '分镜描述',
    key: 'storyboard',
    path: '/project/:id/storyboard',
    icon: IconFile,
  },
  {
    name: '分镜出图',
    key: 'panel-images',
    path: '/project/:id/panel-images',
    icon: IconCamera,
  },
  {
    name: '资产',
    key: 'assets',
    path: '/project/:id/assets',
    icon: IconFolder,
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
      {
        name: '用户管理',
        key: 'users',
        path: '/settings/users',
        icon: IconUserGroup,
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
