/**
 * 预设库页面 - 管理角色/世界观/风格/场景/分镜预设
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Tabs,
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Switch,
  Message,
  Popconfirm,
  Tag,
  Empty,
} from '@arco-design/web-react'
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-react/icon'
import { useParams, useNavigate } from 'react-router-dom'
import { usePresetStore } from '@/stores/preset'
import { PageHeader } from '@/components/styled/common'
import { StyledTable, MonoTextArea } from './styles'
import type { PresetType } from '@/types/preset'
import { presetTypeLabels, presetSlugToType, presetTypeToSlug } from '@/types/preset'

const { Title } = Typography
const FormItem = Form.Item
const TabPane = Tabs.TabPane

const presetTabs: { key: PresetType; label: string }[] = [
  { key: 'character', label: '角色预设' },
  { key: 'world', label: '世界观预设' },
  { key: 'style', label: '风格预设' },
  { key: 'scene', label: '场景预设' },
  { key: 'storyboard', label: '分镜预设' },
]


export default function PresetsPage() {
  const { type: typeSlug } = useParams<{ type: string }>()
  const navigate = useNavigate()
  const { presets, loading, fetchPresets, createPreset, updatePreset, deletePreset } = usePresetStore()

  const currentType: PresetType = typeSlug ? (presetSlugToType[typeSlug] || 'character') : 'character'

  // 创建/编辑弹窗
  const [modalVisible, setModalVisible] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form] = Form.useForm()
  const [submitLoading, setSubmitLoading] = useState(false)

  const loadPresets = useCallback(() => {
    fetchPresets({ type: currentType, scope: 'all' })
  }, [currentType, fetchPresets])

  useEffect(() => {
    loadPresets()
  }, [loadPresets])

  const handleTabChange = (key: string) => {
    const slug = presetTypeToSlug[key as PresetType]
    navigate(`/presets/${slug}`)
  }

  const handleCreate = () => {
    setEditingId(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingId(record.id)
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      is_public: record.is_public,
      data_json: JSON.stringify(record.data, null, 2),
    })
    setModalVisible(true)
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validate()
      setSubmitLoading(true)

      let data: Record<string, any> = {}
      try {
        data = values.data_json ? JSON.parse(values.data_json) : {}
      } catch {
        Message.error('数据 JSON 格式错误')
        setSubmitLoading(false)
        return
      }

      if (editingId) {
        await updatePreset(editingId, {
          name: values.name,
          description: values.description,
          data,
          is_public: values.is_public || false,
        })
        Message.success('预设已更新')
      } else {
        await createPreset({
          type: currentType,
          name: values.name,
          description: values.description,
          data,
          is_public: values.is_public || false,
        })
        Message.success('预设已创建')
      }
      setModalVisible(false)
      loadPresets()
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail) Message.error(detail)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deletePreset(id)
      Message.success('预设已删除')
    } catch (error: any) {
      Message.error(error?.response?.data?.detail || '删除失败')
    }
  }

  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '公开',
      dataIndex: 'is_public',
      width: 80,
      render: (val: boolean) => val ? <Tag color="green">公开</Tag> : <Tag>私有</Tag>,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      width: 170,
      render: (val: string) => new Date(val).toLocaleString('zh-CN'),
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

  return (
    <div>
      <PageHeader>
        <Title heading={4}>预设库</Title>
        <Button type="primary" icon={<IconPlus />} onClick={handleCreate}>
          新建预设
        </Button>
      </PageHeader>

      <Card>
        <Tabs activeTab={currentType} onChange={handleTabChange}>
          {presetTabs.map((tab) => (
            <TabPane key={tab.key} title={tab.label} />
          ))}
        </Tabs>

        <StyledTable
          columns={columns}
          data={presets}
          rowKey="id"
          loading={loading}
          pagination={false}
          noDataElement={<Empty description={`暂无${presetTypeLabels[currentType]}预设，点击新建`} />}
        />
      </Card>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={editingId ? '编辑预设' : `新建${presetTypeLabels[currentType]}预设`}
        visible={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        confirmLoading={submitLoading}
        style={{ width: 600 }}
      >
        <Form form={form} layout="vertical">
          <FormItem label="名称" field="name" rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder="预设名称" />
          </FormItem>
          <FormItem label="描述" field="description">
            <Input.TextArea placeholder="简要描述此预设" rows={2} />
          </FormItem>
          <FormItem label="是否公开" field="is_public" triggerPropName="checked">
            <Switch checkedText="公开" uncheckedText="私有" />
          </FormItem>
          <FormItem label="数据 (JSON)" field="data_json" rules={[{ required: true, message: '请输入数据' }]}>
            <MonoTextArea
              placeholder={'{\n  "key": "value"\n}'}
              rows={10}
            />
          </FormItem>
        </Form>
      </Modal>
    </div>
  )
}
