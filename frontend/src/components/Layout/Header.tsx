import { Layout, Menu, Typography, Dropdown } from '@arco-design/web-react'
import { IconApps, IconSettings, IconRobot } from '@arco-design/web-react/icon'
import { useNavigate } from 'react-router-dom'
import styles from './index.module.css'

const { Header: ArcoHeader } = Layout

export default function Header() {
  const navigate = useNavigate()

  const settingsMenu = (
    <Menu onClickMenuItem={(key) => {
      if (key === 'ai-models') {
        navigate('/settings/ai-models')
      }
    }}>
      <Menu.Item key="ai-models">
        <IconRobot style={{ marginRight: 8 }} />
        AI 模型管理
      </Menu.Item>
    </Menu>
  )

  return (
    <ArcoHeader className={styles.header}>
      <div className={styles.logo} onClick={() => navigate('/')}>
        <IconApps style={{ fontSize: 24, marginRight: 8 }} />
        <Typography.Title heading={5} style={{ margin: 0 }}>
          MAN
        </Typography.Title>
      </div>
      <div className={styles.headerRight}>
        <Dropdown droplist={settingsMenu} position="br">
          <div style={{ cursor: 'pointer', padding: '0 12px', display: 'flex', alignItems: 'center' }}>
            <IconSettings style={{ fontSize: 18 }} />
          </div>
        </Dropdown>
      </div>
    </ArcoHeader>
  )
}
