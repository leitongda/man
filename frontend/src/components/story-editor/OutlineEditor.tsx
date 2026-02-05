import { useState } from 'react'
import {
  Card,
  Typography,
  Button,
  Space,
  Timeline,
  Tag,
  Input,
  Form,
  Modal,
  Select,
  Empty,
} from '@arco-design/web-react'
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-react/icon'
import type { Beat, StoryOutline } from '@/types/project'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input

interface OutlineEditorProps {
  outline: StoryOutline | null
  onUpdate: (outline: StoryOutline) => void
  onGenerate: (length: 'short' | 'mid' | 'long') => void
  generating?: boolean
}

const beatTypeLabels: Record<string, string> = {
  setup: '铺垫',
  conflict: '冲突',
  twist: '反转',
  climax: '高潮',
  resolution: '结局',
}

const beatTypeColors: Record<string, string> = {
  setup: 'gray',
  conflict: 'orange',
  twist: 'purple',
  climax: 'red',
  resolution: 'green',
}

export default function OutlineEditor({
  outline,
  onUpdate,
  onGenerate,
  generating = false,
}: OutlineEditorProps) {
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const handleEditBeat = (beat: Beat) => {
    setEditingBeat(beat)
    form.setFieldsValue(beat)
    setModalVisible(true)
  }

  const handleAddBeat = () => {
    const newBeat: Beat = {
      id: `beat_${Date.now()}`,
      order: (outline?.outline.length || 0) + 1,
      type: 'conflict',
      description: '',
      characters_involved: [],
    }
    setEditingBeat(newBeat)
    form.setFieldsValue(newBeat)
    setModalVisible(true)
  }

  const handleSaveBeat = async () => {
    try {
      const values = await form.validate()
      const updatedBeat: Beat = {
        ...editingBeat!,
        ...values,
      }

      if (!outline) return

      const existingIndex = outline.outline.findIndex((b) => b.id === updatedBeat.id)
      const newOutline = { ...outline }

      if (existingIndex >= 0) {
        newOutline.outline[existingIndex] = updatedBeat
      } else {
        newOutline.outline.push(updatedBeat)
      }

      onUpdate(newOutline)
      setModalVisible(false)
      form.resetFields()
    } catch (e) {
      console.error('Validation failed:', e)
    }
  }

  const handleDeleteBeat = (beatId: string) => {
    if (!outline) return

    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个节拍吗？',
      onOk: () => {
        const newOutline = {
          ...outline,
          outline: outline.outline.filter((b) => b.id !== beatId),
        }
        onUpdate(newOutline)
      },
    })
  }

  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title heading={5} style={{ margin: 0 }}>故事大纲</Title>
          <Space>
            <Button.Group>
              <Button
                onClick={() => onGenerate('short')}
                loading={generating}
              >
                生成短版
              </Button>
              <Button
                onClick={() => onGenerate('mid')}
                loading={generating}
              >
                生成中版
              </Button>
              <Button
                onClick={() => onGenerate('long')}
                loading={generating}
              >
                生成长版
              </Button>
            </Button.Group>
          </Space>
        </div>
      </Card>

      {outline ? (
        <>
          <Card title="故事摘要" style={{ marginBottom: 16 }}>
            <Paragraph>
              <Text strong>短版摘要：</Text>
              <br />
              {outline.synopsis_short || '暂无'}
            </Paragraph>
            {outline.synopsis_mid && (
              <Paragraph>
                <Text strong>中版摘要：</Text>
                <br />
                {outline.synopsis_mid.slice(0, 500)}...
              </Paragraph>
            )}
          </Card>

          <Card
            title="故事节拍"
            extra={
              <Button icon={<IconPlus />} onClick={handleAddBeat}>
                添加节拍
              </Button>
            }
          >
            <Timeline>
              {outline.outline
                .sort((a, b) => a.order - b.order)
                .map((beat) => (
                  <Timeline.Item
                    key={beat.id}
                    label={
                      <Tag color={beatTypeColors[beat.type]}>
                        {beatTypeLabels[beat.type]}
                      </Tag>
                    }
                  >
                    <Card size="small" style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <Text strong>Beat {beat.order}</Text>
                          <Paragraph style={{ margin: '8px 0' }}>
                            {beat.description}
                          </Paragraph>
                          {beat.characters_involved.length > 0 && (
                            <Space>
                              <Text type="secondary">涉及角色：</Text>
                              {beat.characters_involved.map((charId) => (
                                <Tag key={charId} size="small">
                                  {charId}
                                </Tag>
                              ))}
                            </Space>
                          )}
                        </div>
                        <Space>
                          <Button
                            type="text"
                            icon={<IconEdit />}
                            onClick={() => handleEditBeat(beat)}
                          />
                          <Button
                            type="text"
                            status="danger"
                            icon={<IconDelete />}
                            onClick={() => handleDeleteBeat(beat.id)}
                          />
                        </Space>
                      </div>
                    </Card>
                  </Timeline.Item>
                ))}
            </Timeline>
          </Card>
        </>
      ) : (
        <Card>
          <Empty description="暂无大纲，点击上方按钮生成" />
        </Card>
      )}

      <Modal
        title={editingBeat?.description ? '编辑节拍' : '添加节拍'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onOk={handleSaveBeat}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="节拍类型"
            field="type"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="setup">铺垫</Select.Option>
              <Select.Option value="conflict">冲突</Select.Option>
              <Select.Option value="twist">反转</Select.Option>
              <Select.Option value="climax">高潮</Select.Option>
              <Select.Option value="resolution">结局</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            label="描述"
            field="description"
            rules={[{ required: true, message: '请输入节拍描述' }]}
          >
            <TextArea rows={4} placeholder="描述这个节拍发生了什么" />
          </Form.Item>
          <Form.Item label="顺序" field="order">
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
