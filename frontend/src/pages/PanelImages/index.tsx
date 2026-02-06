/**
 * 分镜出图页面 - 展示分镜描述和生成的图片
 */
import { useState, useEffect } from 'react'
import {
  Card,
  Typography,
  Button,
  Space,
  Grid,
  Tag,
  Empty,
  Spin,
  Image,
  Message,
} from '@arco-design/web-react'
import { IconRobot, IconRefresh } from '@arco-design/web-react/icon'
import { useParams } from 'react-router-dom'
import { storyboardApi, generationApi } from '@/services/api'

const { Title, Paragraph } = Typography
const { Row, Col } = Grid

const statusColors: Record<string, string> = {
  pending: 'gray',
  rough: 'orangered',
  final: 'blue',
  approved: 'green',
  rejected: 'red',
}

const statusLabels: Record<string, string> = {
  pending: '待生成',
  rough: '草图',
  final: '定稿',
  approved: '已通过',
  rejected: '已拒绝',
}

export default function PanelImagesPage() {
  const { id: projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [panels, setPanels] = useState<any[]>([])

  useEffect(() => {
    if (projectId) loadPanels()
  }, [projectId])

  const loadPanels = async () => {
    setLoading(true)
    try {
      const data = await storyboardApi.listPanels(projectId!) as any
      setPanels(Array.isArray(data) ? data : [])
    } catch {
      setPanels([])
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePanel = async (panelId: string) => {
    try {
      await generationApi.generatePanel(projectId!, panelId, true)
      Message.info('图像生成功能待实现')
    } catch {
      Message.error('生成失败')
    }
  }

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60 }}><Spin size={32} /></div>
  }

  // 按章节分组
  const grouped: Record<string, any[]> = {}
  panels.forEach((p) => {
    const key = `第${p.chapter_order}章: ${p.chapter_title}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(p)
  })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title heading={4}>分镜出图</Title>
        <Space>
          <Button icon={<IconRefresh />} onClick={loadPanels}>刷新</Button>
          <Button type="primary" icon={<IconRobot />} disabled={panels.length === 0}>
            批量生成
          </Button>
        </Space>
      </div>

      {panels.length === 0 ? (
        <Card>
          <Empty description="暂无分镜，请先在「分镜描述」页面创建分镜脚本" />
        </Card>
      ) : (
        Object.entries(grouped).map(([chapterTitle, chapterPanels]) => (
          <Card
            key={chapterTitle}
            title={chapterTitle}
            style={{ marginBottom: 16 }}
            extra={
              <Button size="small" icon={<IconRobot />}>
                生成本章全部
              </Button>
            }
          >
            <Row gutter={[16, 16]}>
              {chapterPanels.map((panel) => (
                <Col xs={24} sm={12} md={8} lg={6} key={panel.id}>
                  <Card
                    hoverable
                    bodyStyle={{ padding: 12 }}
                  >
                    {/* 图片区域 */}
                    <div
                      style={{
                        width: '100%',
                        aspectRatio: '3/4',
                        background: 'var(--color-fill-2)',
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 8,
                        overflow: 'hidden',
                      }}
                    >
                      {panel.final_image || panel.rough_image ? (
                        <Image
                          src={panel.final_image || panel.rough_image}
                          width="100%"
                          height="100%"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <Button
                          type="text"
                          icon={<IconRobot />}
                          onClick={() => handleGeneratePanel(panel.id)}
                        >
                          生成图片
                        </Button>
                      )}
                    </div>

                    {/* 信息 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag size="small">#{panel.order}</Tag>
                      <Tag size="small" color={statusColors[panel.status]}>
                        {statusLabels[panel.status] || panel.status}
                      </Tag>
                    </div>
                    {panel.action && (
                      <Paragraph
                        type="secondary"
                        ellipsis={{ rows: 2 }}
                        style={{ margin: '4px 0 0', fontSize: 12 }}
                      >
                        {panel.action}
                      </Paragraph>
                    )}
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        ))
      )}
    </div>
  )
}
