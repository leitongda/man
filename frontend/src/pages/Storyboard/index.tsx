import { Card, Typography, Button, Empty, Grid } from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'

const { Title } = Typography
const { Row, Col } = Grid

export default function StoryboardPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title heading={4}>分镜脚本</Title>
        <Button type="primary" icon={<IconPlus />}>
          生成分镜
        </Button>
      </div>

      <Card>
        <Empty
          description={
            <span>
              暂无分镜，请先完成世界观建档和故事扩写
            </span>
          }
        />
      </Card>
    </div>
  )
}
