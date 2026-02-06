/**
 * Arco Pro 风格布局组件
 */
import { useState, useEffect } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { Layout, Spin, Breadcrumb } from '@arco-design/web-react'
import NavBar from './NavBar'
import Sidebar from './Sidebar'
import { useGlobalContext } from '@/context'
import { homeRoutes, projectRoutes, settingsRoutes, getBreadcrumb } from '@/routes'
import styles from './layout.module.css'

const { Sider, Content } = Layout

export default function PageLayout() {
  const location = useLocation()
  const { id: projectId } = useParams()
  const { settings, collapsed } = useGlobalContext()
  const [loading, setLoading] = useState(false)

  // 根据当前路径判断使用哪组路由
  const isInProject = location.pathname.startsWith('/project/')
  const isInSettings = location.pathname.startsWith('/settings')

  // 获取当前路由对应的面包屑
  const routes = isInProject ? projectRoutes : isInSettings ? settingsRoutes : homeRoutes
  const breadcrumb = getBreadcrumb(location.pathname, routes)

  // 计算布局样式
  const navbarHeight = 60
  const menuWidth = collapsed ? 48 : settings.menuWidth

  const showNavbar = settings.navbar
  const showMenu = settings.menu
  const showFooter = settings.footer

  const paddingLeft = showMenu ? { paddingLeft: menuWidth } : {}
  const paddingTop = showNavbar ? { paddingTop: navbarHeight } : {}
  const paddingStyle = { ...paddingLeft, ...paddingTop }

  return (
    <Layout className={styles.layout}>
      {/* 导航栏 */}
      {showNavbar && (
        <div className={styles.navbar}>
          <NavBar />
        </div>
      )}

      {loading ? (
        <Spin className={styles.spin} />
      ) : (
        <Layout>
          {/* 侧边栏 */}
          {showMenu && (
            <Sider
              className={styles.sider}
              width={menuWidth}
              collapsed={collapsed}
              collapsible
              trigger={null}
              breakpoint="xl"
              style={paddingTop}
            >
              <Sidebar projectId={projectId} />
            </Sider>
          )}

          {/* 内容区 */}
          <Layout className={styles.contentLayout} style={paddingStyle}>
            <div className={styles.contentWrapper}>
              {/* 面包屑 */}
              {breadcrumb.length > 0 && (
                <div className={styles.breadcrumb}>
                  <Breadcrumb>
                    {breadcrumb.map((item, index) => (
                      <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
                    ))}
                  </Breadcrumb>
                </div>
              )}

              {/* 页面内容 */}
              <Content className={styles.content}>
                <Outlet />
              </Content>
            </div>

            {/* 页脚 */}
            {showFooter && (
              <div className={styles.footer}>
                MAN - AI 漫画生成系统 © 2024
              </div>
            )}
          </Layout>
        </Layout>
      )}
    </Layout>
  )
}
