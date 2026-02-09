import { Card, Typography, Tabs, Button, Empty } from '@arco-design/web-react'
import { IconUpload } from '@arco-design/web-react/icon'
import { PageHeaderLarge } from '@/components/styled/common'

const { Title } = Typography
const TabPane = Tabs.TabPane

export default function AssetsPage() {
  return (
    <div>
      <PageHeaderLarge>
        <Title heading={4}>资产管理</Title>
        <Button type="primary" icon={<IconUpload />}>
          上传资产
        </Button>
      </PageHeaderLarge>

      <Tabs defaultActiveTab="characters">
        <TabPane key="characters" title="角色">
          <Card>
            <Empty description="暂无角色资产" />
          </Card>
        </TabPane>
        <TabPane key="environments" title="场景">
          <Card>
            <Empty description="暂无场景资产" />
          </Card>
        </TabPane>
        <TabPane key="panels" title="分镜">
          <Card>
            <Empty description="暂无分镜资产" />
          </Card>
        </TabPane>
        <TabPane key="pages" title="成品页">
          <Card>
            <Empty description="暂无成品页" />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}
