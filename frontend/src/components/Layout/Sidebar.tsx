import { Menu } from '@arco-design/web-react'
import {
  IconHome,
  IconBook,
  IconImage,
  IconFile,
  IconApps,
  IconFolder,
} from '@arco-design/web-react/icon'
import { useNavigate, useLocation, useParams } from 'react-router-dom'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams()

  const menuItems = id
    ? [
        { key: `/project/${id}`, icon: <IconHome />, label: '项目概览' },
        { key: `/project/${id}/story-bible`, icon: <IconBook />, label: '世界观' },
        { key: `/project/${id}/storyboard`, icon: <IconImage />, label: '分镜' },
        { key: `/project/${id}/assets`, icon: <IconFolder />, label: '资产' },
        { key: `/project/${id}/workflow`, icon: <IconApps />, label: '工作流' },
      ]
    : [
        { key: '/', icon: <IconHome />, label: '首页' },
        { key: '/projects', icon: <IconFile />, label: '项目列表' },
      ]

  return (
    <Menu
      selectedKeys={[location.pathname]}
      onClickMenuItem={(key) => navigate(key)}
      style={{ width: '100%', height: '100%' }}
    >
      {menuItems.map((item) => (
        <Menu.Item key={item.key}>
          {item.icon}
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  )
}
