/**
 * 章节管理页面
 */
import { useState, useEffect } from 'react'
import {
  Card,
  Typography,
  Button,
  Space,
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Message,
  Spin,
  Empty,
  Popconfirm,
  Tag,
} from '@arco-design/web-react'
import { IconPlus, IconRobot, IconEdit, IconDelete, IconImport } from '@arco-design/web-react/icon'
import { useParams } from 'react-router-dom'
import { chapterApi } from '@/services/api'

const { Title } = Typography
const FormItem = Form.Item

export default function ChaptersPage() {
  const { id: projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [chapters, setChapters] = useState<any[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    if (projectId) loadChapters()
  }, [projectId])

  const loadChapters = async () => {
    setLoading(true)
    try {
      const data = await chapterApi.list(projectId!) as any
      setChapters(Array.isArray(data) ? data : [])
    } catch {
      setChapters([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingId(null)
    form.resetFields()
    form.setFieldsValue({ estimated_panels: 12 })
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingId(record.id)
    form.setFieldsValue({
      title: record.title,
      logline: record.logline,
      cliffhanger: record.cliffhanger,
      estimated_panels: record.estimated_panels,
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validate()
      setSubmitLoading(true)
      if (editingId) {
        await chapterApi.update(projectId!, editingId, values)
        Message.success('章节已更新')
      } else {
        await chapterApi.create(projectId!, values)
        Message.success('章节已创建')
      }
      setModalVisible(false)
      loadChapters()
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail) Message.error(detail)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (chapterId: string) => {
    try {
      await chapterApi.delete(projectId!, chapterId)
      Message.success('章节已删除')
      loadChapters()
    } catch {
      Message.error('删除失败')
    }
  }

  const handleGenerate = async () => {
    try {
      await chapterApi.generate(projectId!)
      Message.info('AI章节生成功能待实现')
    } catch {
      Message.error('生成失败')
    }
  }

  const columns = [
    {
      title: '序号',
      dataIndex: 'order',
      width: 70,
      render: (val: number) => <Tag>{`第${val}章`}</Tag>,
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 200,
    },
    {
      title: '简介',
      dataIndex: 'logline',
      ellipsis: true,
    },
    {
      title: '预计格数',
      dataIndex: 'estimated_panels',
      width: 100,
    },
    {
      title: '悬念',
      dataIndex: 'cliffhanger',
      width: 200,
      ellipsis: true,
      render: (val: string) => val || '-',
    },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button type="text" size="small" icon={<IconEdit />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除？" onOk={() => handleDelete(record.id)}>
            <Button type="text" size="small" status="danger" icon={<IconDelete />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 60 }}><Spin size={32} /></div>
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title heading={4}>章节管理</Title>
        <Space>
          <Button icon={<IconRobot />} onClick={handleGenerate}>AI 生成章节</Button>
          <Button type="primary" icon={<IconPlus />} onClick={handleCreate}>
            新建章节
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          columns={columns}
          data={chapters}
          rowKey="id"
          pagination={false}
          noDataElement={<Empty description="暂无章节，点击新建或使用 AI 生成" />}
        />
      </Card>

      {/* 章节编辑弹窗 */}
      <Modal
        title={editingId ? '编辑章节' : '新建章节'}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitLoading}
        style={{ width: 560 }}
      >
        <Form form={form} layout="vertical">
          <FormItem label="标题" field="title" rules={[{ required: true, message: '请输入章节标题' }]}>
            <Input placeholder="章节标题" />
          </FormItem>
          <FormItem label="简介 (Logline)" field="logline">
            <Input.TextArea placeholder="这一章的核心情节..." rows={3} />
          </FormItem>
          <FormItem label="预计格数" field="estimated_panels">
            <InputNumber min={1} max={100} />
          </FormItem>
          <FormItem label="章末悬念" field="cliffhanger">
            <Input.TextArea placeholder="章节结尾的悬念设置（可选）" rows={2} />
          </FormItem>
        </Form>
      </Modal>
    </div>
  )
}
