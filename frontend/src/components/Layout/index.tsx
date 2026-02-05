import { Outlet } from 'react-router-dom'
import { Layout as ArcoLayout } from '@arco-design/web-react'
import Sidebar from './Sidebar'
import Header from './Header'
import styles from './index.module.css'

const { Sider, Content } = ArcoLayout

export default function Layout() {
  return (
    <ArcoLayout className={styles.layout}>
      <Header />
      <ArcoLayout>
        <Sider
          width={240}
          collapsible
          breakpoint="lg"
          className={styles.sider}
        >
          <Sidebar />
        </Sider>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </ArcoLayout>
    </ArcoLayout>
  )
}
