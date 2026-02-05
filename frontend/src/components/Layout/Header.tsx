import { Layout, Menu, Typography } from '@arco-design/web-react'
import { IconApps, IconSettings } from '@arco-design/web-react/icon'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'

const { Header: ArcoHeader } = Layout

export default function Header() {
  const navigate = useNavigate()

  return (
    <ArcoHeader className={styles.header}>
      <div className={styles.logo} onClick={() => navigate('/')}>
        <IconApps style={{ fontSize: 24, marginRight: 8 }} />
        <Typography.Title heading={5} style={{ margin: 0 }}>
          MAN
        </Typography.Title>
      </div>
      <div className={styles.headerRight}>
        <Menu mode="horizontal" style={{ background: 'transparent', border: 'none' }}>
          <Menu.Item key="settings">
            <IconSettings />
          </Menu.Item>
        </Menu>
      </div>
    </ArcoHeader>
  )
}
