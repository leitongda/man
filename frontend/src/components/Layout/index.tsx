/**
 * Arco Pro 风格布局组件
 */
import { useState } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { Layout, Breadcrumb } from '@arco-design/web-react'
import NavBar from './NavBar'
import Sidebar from './Sidebar'
import { useGlobalContext } from '@/context'
import { homeRoutes, projectRoutes, settingsRoutes, getBreadcrumb } from '@/routes'
import {
  RootLayout,
  NavbarWrapper,
  StyledSider,
  ContentLayout,
  ContentWrapper,
  BreadcrumbWrapper,
  StyledContent,
  StyledSpin,
  Footer,
} from './index.styles'

export default function PageLayout() {
  const location = useLocation()
  const { id: projectId } = useParams()
  const { settings, collapsed } = useGlobalContext()
  const [loading] = useState(false)

  const isInProject = location.pathname.startsWith('/project/')
  const isInSettings = location.pathname.startsWith('/settings')

  const routes = isInProject ? projectRoutes : isInSettings ? settingsRoutes : homeRoutes
  const breadcrumb = getBreadcrumb(location.pathname, routes)

  const navbarHeight = 60
  const menuWidth = collapsed ? 48 : settings.menuWidth

  const showNavbar = settings.navbar
  const showMenu = settings.menu
  const showFooter = settings.footer

  return (
    <RootLayout>
      {showNavbar && (
        <NavbarWrapper>
          <NavBar />
        </NavbarWrapper>
      )}

      {loading ? (
        <StyledSpin />
      ) : (
        <Layout>
          {showMenu && (
            <StyledSider
              width={menuWidth}
              collapsed={collapsed}
              collapsible
              trigger={null}
              breakpoint="xl"
              style={showNavbar ? { paddingTop: navbarHeight } : undefined}
            >
              <Sidebar projectId={projectId} />
            </StyledSider>
          )}

          <ContentLayout
            $paddingLeft={showMenu ? menuWidth : undefined}
            $paddingTop={showNavbar ? navbarHeight : undefined}
          >
            <ContentWrapper>
              {breadcrumb.length > 0 && (
                <BreadcrumbWrapper>
                  <Breadcrumb>
                    {breadcrumb.map((item, index) => (
                      <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
                    ))}
                  </Breadcrumb>
                </BreadcrumbWrapper>
              )}

              <StyledContent>
                <Outlet />
              </StyledContent>
            </ContentWrapper>

            {showFooter && (
              <Footer>
                MAN - AI 漫画生成系统 © 2024
              </Footer>
            )}
          </ContentLayout>
        </Layout>
      )}
    </RootLayout>
  )
}
