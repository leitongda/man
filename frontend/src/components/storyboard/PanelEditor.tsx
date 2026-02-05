import { useState } from 'react'
import {
  Card,
  Grid,
  Form,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Image,
  Empty,
  Drawer,
  Descriptions,
  Typography,
} from '@arco-design/web-react'
import {
  IconEdit,
  IconRefresh,
  IconCheck,
  IconClose,
  IconDragDotVertical,
} from '@arco-design/web-react/icon'
import type { Panel, Scene, Character } from '@/types/project'

const { Row, Col } = Grid
const { TextArea } = Input
const { Title, Text } = Typography

interface PanelEditorProps {
  scenes: Scene[]
  characters: Character[]
  onUpdatePanel: (panelId: string, updates: Partial<Panel>) => void
  onRegeneratePanel: (panelId: string, rough: boolean) => void
  onApprovePanel: (panelId: string) => void
  onRejectPanel: (panelId: string) => void
}

const cameraOptions = [
  { value: 'wide', label: '远景' },
  { value: 'medium', label: '中景' },
  { value: 'close_up', label: '近景' },
  { value: 'extreme_close_up', label: '特写' },
  { value: 'bird_eye', label: '俯视' },
  { value: 'worm_eye', label: '仰视' },
]

const statusColors: Record<string, string> = {
  pending: 'gray',
  rough: 'orange',
  final: 'blue',
  approved: 'green',
  rejected: 'red',
}

const statusLabels: Record<string, string> = {
  pending: '待生成',
  rough: '草稿',
  final: '成稿',
  approved: '已通过',
  rejected: '已拒绝',
}

export default function PanelEditor({
  scenes,
  characters,
  onUpdatePanel,
  onRegeneratePanel,
  onApprovePanel,
  onRejectPanel,
}: PanelEditorProps) {
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [form] = Form.useForm()

  const handlePanelClick = (panel: Panel) => {
    setSelectedPanel(panel)
    form.setFieldsValue(panel)
    setDrawerVisible(true)
  }

  const handleSavePanel = async () => {
    if (!selectedPanel) return
    
    try {
      const values = await form.validate()
      onUpdatePanel(selectedPanel.id, values)
      setDrawerVisible(false)
    } catch (e) {
      console.error('Validation failed:', e)
    }
  }

  const getCharacterName = (charId: string) => {
    const char = characters.find((c) => c.id === charId)
    return char?.name || charId
  }

  const allPanels = scenes.flatMap((scene) =>
    scene.panels.map((panel) => ({ ...panel, sceneName: scene.location }))
  )

  return (
    <div>
      {scenes.length === 0 ? (
        <Empty description="暂无分镜，请先生成分镜脚本" />
      ) : (
        <div>
          {scenes.map((scene, sceneIndex) => (
            <div key={scene.id} style={{ marginBottom: 24 }}>
              <Title heading={5} style={{ marginBottom: 12 }}>
                场景 {sceneIndex + 1}: {scene.location}
                <Text type="secondary" style={{ marginLeft: 8, fontSize: 14 }}>
                  {scene.time} · {scene.mood}
                </Text>
              </Title>
              
              <Row gutter={[16, 16]}>
                {scene.panels.map((panel, panelIndex) => (
                  <Col span={6} key={panel.id}>
                    <Card
                      hoverable
                      style={{ cursor: 'pointer' }}
                      onClick={() => handlePanelClick(panel)}
                      cover={
                        panel.final_image || panel.rough_image ? (
                          <div style={{ height: 200, overflow: 'hidden' }}>
                            <Image
                              src={`data:image/png;base64,${panel.final_image || panel.rough_image}`}
                              alt={`Panel ${panel.order}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        ) : (
                          <div
                            style={{
                              height: 200,
                              background: 'var(--color-fill-2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text type="secondary">P{panel.order}</Text>
                          </div>
                        )
                      }
                    >
                      <Card.Meta
                        title={
                          <Space>
                            <span>#{panel.order}</span>
                            <Tag color={statusColors[panel.status]} size="small">
                              {statusLabels[panel.status]}
                            </Tag>
                          </Space>
                        }
                        description={
                          <div style={{ fontSize: 12 }}>
                            <div>{panel.action?.slice(0, 30)}...</div>
                            <Space size={4} style={{ marginTop: 4 }}>
                              <Tag size="small">{cameraOptions.find(c => c.value === panel.camera)?.label}</Tag>
                              {panel.characters.slice(0, 2).map((charId) => (
                                <Tag key={charId} size="small" color="arcoblue">
                                  {getCharacterName(charId)}
                                </Tag>
                              ))}
                            </Space>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </div>
      )}

      <Drawer
        title={`编辑分镜 #${selectedPanel?.order || ''}`}
        visible={drawerVisible}
        width={600}
        onCancel={() => setDrawerVisible(false)}
        footer={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleSavePanel}>
              保存
            </Button>
          </Space>
        }
      >
        {selectedPanel && (
          <div>
            {(selectedPanel.final_image || selectedPanel.rough_image) && (
              <div style={{ marginBottom: 16 }}>
                <Image
                  src={`data:image/png;base64,${selectedPanel.final_image || selectedPanel.rough_image}`}
                  alt="Panel"
                  style={{ width: '100%', maxHeight: 300, objectFit: 'contain' }}
                />
                <Space style={{ marginTop: 8 }}>
                  <Button
                    icon={<IconRefresh />}
                    onClick={() => onRegeneratePanel(selectedPanel.id, true)}
                  >
                    重新生成草稿
                  </Button>
                  <Button
                    type="primary"
                    icon={<IconRefresh />}
                    onClick={() => onRegeneratePanel(selectedPanel.id, false)}
                  >
                    生成成稿
                  </Button>
                  {selectedPanel.status === 'final' && (
                    <>
                      <Button
                        status="success"
                        icon={<IconCheck />}
                        onClick={() => onApprovePanel(selectedPanel.id)}
                      >
                        通过
                      </Button>
                      <Button
                        status="danger"
                        icon={<IconClose />}
                        onClick={() => onRejectPanel(selectedPanel.id)}
                      >
                        拒绝
                      </Button>
                    </>
                  )}
                </Space>
              </div>
            )}

            <Form form={form} layout="vertical">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="镜头类型" field="camera">
                    <Select options={cameraOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="出场角色" field="characters">
                    <Select
                      mode="multiple"
                      options={characters.map((c) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="动作描述" field="action">
                <TextArea rows={3} placeholder="描述这一格的动作" />
              </Form.Item>

              <Form.Item label="表情" field="expression">
                <Input placeholder="角色的表情" />
              </Form.Item>

              <Form.Item label="构图说明" field="composition">
                <TextArea rows={2} placeholder="主体位置、视觉重点等" />
              </Form.Item>

              <Form.Item label="一致性备注" field="continuity_notes">
                <TextArea rows={2} placeholder="需要保持一致的细节" />
              </Form.Item>
            </Form>
          </div>
        )}
      </Drawer>
    </div>
  )
}
