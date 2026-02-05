import { Card, Typography, Tabs, Button, Empty } from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'

const { Title } = Typography
const TabPane = Tabs.TabPane

export default function StoryBiblePage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title heading={4}>世界观 (Story Bible)</Title>
        <Button type="primary" icon={<IconPlus />}>
          AI生成
        </Button>
      </div>

      <Tabs defaultActiveTab="characters">
        <TabPane key="characters" title="角色设定">
          <Card>
            <Empty description="暂无角色，点击AI生成自动创建" />
          </Card>
        </TabPane>
        <TabPane key="world" title="世界观">
          <Card>
            <Empty description="暂无世界观设定" />
          </Card>
        </TabPane>
        <TabPane key="style" title="风格指南">
          <Card>
            <Empty description="暂无风格指南" />
          </Card>
        </TabPane>
        <TabPane key="continuity" title="一致性规则">
          <Card>
            <Empty description="暂无一致性规则" />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}
