/**
 * AI 模型管理页面
 */

import { useState, useEffect } from 'react'
import {
  Button,
  Typography,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Switch,
  Table,
  Tag,
  Message,
  Popconfirm,
  Collapse,
  Spin,
} from '@arco-design/web-react'
import {
  IconPlus,
  IconEdit,
  IconDelete,
  IconCheckCircle,
  IconCloseCircle,
  IconStar,
  IconStarFill,
  IconThunderbolt,
} from '@arco-design/web-react/icon'
import {
  aiModelApi,
  type AIModel,
  type AIModelCreateRequest,
  type AIModelUpdateRequest,
  type ModelProvider,
  type ModelType,
  providerLabels,
  modelTypeLabels,
  getFieldsByProvider,
  getSupportedTypesByProvider,
} from '@/services/aiModel'
import { EmptyCenter } from '@/components/styled/common'
import { PageHeaderRow, HeaderTitle } from './AIModels.styles'

const { Text } = Typography
const FormItem = Form.Item
const CollapseItem = Collapse.Item


export default function AIModelsPage() {
  const [loading, setLoading] = useState(true)
  const [models, setModels] = useState<AIModel[]>([])
  const [modalVisible, setModalVisible] = useState(false)
  const [editingModel, setEditingModel] = useState<AIModel | null>(null)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [form] = Form.useForm()

  // 当前选择的提供商
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider>('openai')

  // 加载模型列表
  const loadModels = async () => {
    setLoading(true)
    try {
      const response = await aiModelApi.list()
      setModels(response?.items || [])
    } catch (error) {
      Message.error('加载模型列表失败')
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadModels()
  }, [])

  // 打开创建/编辑弹窗
  const openModal = (model?: AIModel) => {
    if (model) {
      setEditingModel(model)
      setSelectedProvider(model.provider)
      form.setFieldsValue({
        ...model,
        api_key: '', // 不显示已有的 API Key
      })
    } else {
      setEditingModel(null)
      setSelectedProvider('openai')
      form.resetFields()
    }
    setModalVisible(true)
  }

  // 保存模型
  const handleSave = async () => {
    try {
      const values = await form.validate()
      
      // 过滤空值
      const data: any = {}
      Object.keys(values).forEach(key => {
        if (values[key] !== undefined && values[key] !== '' && values[key] !== null) {
          data[key] = values[key]
        }
      })

      if (editingModel) {
        await aiModelApi.update(editingModel.id, data as AIModelUpdateRequest)
        Message.success('模型配置已更新')
      } else {
        await aiModelApi.create(data as AIModelCreateRequest)
        Message.success('模型配置已创建')
      }

      setModalVisible(false)
      loadModels()
    } catch (error: any) {
      Message.error(error.response?.data?.detail || '保存失败')
    }
  }

  // 删除模型
  const handleDelete = async (id: string) => {
    try {
      await aiModelApi.delete(id)
      Message.success('已删除')
      loadModels()
    } catch (error) {
      Message.error('删除失败')
    }
  }

  // 测试连接
  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      const result = await aiModelApi.test(id)
      if (result.success) {
        Message.success(`连接成功 (${result.latency_ms}ms)`)
      } else {
        Message.error(result.message)
      }
    } catch (error: any) {
      Message.error(error.response?.data?.detail || '测试失败')
    } finally {
      setTestingId(null)
    }
  }

  // 设为默认
  const handleSetDefault = async (id: string) => {
    try {
      await aiModelApi.setDefault(id)
      Message.success('已设为默认')
      loadModels()
    } catch (error) {
      Message.error('操作失败')
    }
  }

  // 切换启用状态
  const handleToggleEnabled = async (model: AIModel) => {
    try {
      await aiModelApi.update(model.id, { is_enabled: !model.is_enabled })
      loadModels()
    } catch (error) {
      Message.error('操作失败')
    }
  }

  // 按类型分组模型
  const groupedModels = (models || []).reduce((acc, model) => {
    const type = model.model_type
    if (!acc[type]) acc[type] = []
    acc[type].push(model)
    return acc
  }, {} as Record<ModelType, AIModel[]>)

  // 表格列
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      render: (name: string, record: AIModel) => (
        <Space>
          <Text>{name}</Text>
          {record.is_default && (
            <Tag color="gold" icon={<IconStarFill />}>
              默认
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '提供商',
      dataIndex: 'provider',
      render: (provider: ModelProvider) => (
        <Tag>{providerLabels[provider]}</Tag>
      ),
    },
    {
      title: '模型',
      dataIndex: 'model_name',
    },
    {
      title: 'API Key',
      dataIndex: 'has_api_key',
      render: (hasKey: boolean) =>
        hasKey ? (
          <Tag color="green" icon={<IconCheckCircle />}>
            已配置
          </Tag>
        ) : (
          <Tag color="gray" icon={<IconCloseCircle />}>
            未配置
          </Tag>
        ),
    },
    {
      title: '状态',
      dataIndex: 'is_enabled',
      render: (enabled: boolean, record: AIModel) => (
        <Switch
          checked={enabled}
          onChange={() => handleToggleEnabled(record)}
        />
      ),
    },
    {
      title: '操作',
      render: (_: any, record: AIModel) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<IconThunderbolt />}
            loading={testingId === record.id}
            onClick={() => handleTest(record.id)}
          >
            测试
          </Button>
          {!record.is_default && (
            <Button
              type="text"
              size="small"
              icon={<IconStar />}
              onClick={() => handleSetDefault(record.id)}
            >
              设为默认
            </Button>
          )}
          <Button
            type="text"
            size="small"
            icon={<IconEdit />}
            onClick={() => openModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个模型配置吗？"
            onOk={() => handleDelete(record.id)}
          >
            <Button
              type="text"
              size="small"
              status="danger"
              icon={<IconDelete />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  // 需要显示的字段
  const visibleFields = getFieldsByProvider(selectedProvider)
  const supportedTypes = getSupportedTypesByProvider(selectedProvider)

  return (
    <div>
      <PageHeaderRow>
        <div>
          <HeaderTitle heading={4}>
            AI 模型管理
          </HeaderTitle>
          <Text type="secondary">
            配置和管理 AI 模型，包括文本生成、图像生成和图像分析模型
          </Text>
        </div>
        <Button type="primary" icon={<IconPlus />} onClick={() => openModal()}>
          添加模型
        </Button>
      </PageHeaderRow>

      <Spin loading={loading} style={{ width: '100%' }}>
        <Collapse defaultActiveKey={['text_generation', 'image_generation', 'image_analysis']}>
          {(['text_generation', 'image_generation', 'image_analysis'] as ModelType[]).map(type => (
            <CollapseItem
              key={type}
              name={type}
              header={
                <Space>
                  <Text bold>{modelTypeLabels[type]}</Text>
                  <Tag>{groupedModels[type]?.length || 0}</Tag>
                </Space>
              }
            >
              {groupedModels[type]?.length > 0 ? (
                <Table
                  columns={columns}
                  data={groupedModels[type]}
                  rowKey="id"
                  pagination={false}
                  border={false}
                />
              ) : (
                <EmptyCenter>
                  暂未配置 {modelTypeLabels[type]} 模型
                </EmptyCenter>
              )}
            </CollapseItem>
          ))}
        </Collapse>
      </Spin>

      {/* 创建/编辑弹窗 */}
      <Modal
        title={editingModel ? '编辑模型配置' : '添加模型配置'}
        visible={modalVisible}
        onOk={handleSave}
        onCancel={() => setModalVisible(false)}
        style={{ width: 600 }}
        unmountOnExit
      >
        <Form form={form} layout="vertical">
          <FormItem
            label="提供商"
            field="provider"
            initialValue="openai"
            rules={[{ required: true }]}
          >
            <Select
              disabled={!!editingModel}
              onChange={(value: ModelProvider) => {
                setSelectedProvider(value)
                // 重置模型类型
                const types = getSupportedTypesByProvider(value)
                if (types.length > 0) {
                  form.setFieldValue('model_type', types[0])
                }
              }}
            >
              {Object.entries(providerLabels).map(([value, label]) => (
                <Select.Option key={value} value={value}>
                  {label}
                </Select.Option>
              ))}
            </Select>
          </FormItem>

          <FormItem
            label="模型类型"
            field="model_type"
            initialValue="text_generation"
            rules={[{ required: true }]}
          >
            <Select disabled={!!editingModel}>
              {supportedTypes.map(type => (
                <Select.Option key={type} value={type}>
                  {modelTypeLabels[type]}
                </Select.Option>
              ))}
            </Select>
          </FormItem>

          <FormItem
            label="显示名称"
            field="name"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="例如：GPT-4 Turbo" />
          </FormItem>

          <FormItem
            label="模型名称"
            field="model_name"
            rules={[{ required: true, message: '请输入模型名称' }]}
          >
            <Input placeholder="例如：gpt-4-turbo-preview" />
          </FormItem>

          {visibleFields.includes('api_key') && (
            <FormItem
              label="API Key"
              field="api_key"
              extra={editingModel?.has_api_key ? '已配置 API Key，留空则保持不变' : undefined}
            >
              <Input.Password placeholder="输入 API Key" />
            </FormItem>
          )}

          {visibleFields.includes('base_url') && (
            <FormItem
              label="API 地址"
              field="base_url"
              extra="自定义 API 地址，留空则使用默认地址"
            >
              <Input placeholder="例如：https://api.openai.com/v1" />
            </FormItem>
          )}

          {visibleFields.includes('organization_id') && (
            <FormItem label="组织 ID" field="organization_id">
              <Input placeholder="OpenAI 组织 ID（可选）" />
            </FormItem>
          )}

          {visibleFields.includes('api_version') && (
            <FormItem label="API 版本" field="api_version">
              <Input placeholder="例如：2024-02-01（Azure 需要）" />
            </FormItem>
          )}

          {visibleFields.includes('deployment_name') && (
            <FormItem label="部署名称" field="deployment_name">
              <Input placeholder="Azure 部署名称" />
            </FormItem>
          )}

          {visibleFields.includes('checkpoint_name') && (
            <FormItem label="模型文件" field="checkpoint_name">
              <Input placeholder="SD 模型文件名" />
            </FormItem>
          )}

          {visibleFields.includes('default_sampler') && (
            <FormItem label="默认采样器" field="default_sampler">
              <Input placeholder="例如：DPM++ 2M Karras" />
            </FormItem>
          )}

          {visibleFields.includes('default_steps') && (
            <FormItem label="默认步数" field="default_steps">
              <InputNumber min={1} max={150} placeholder="20" style={{ width: '100%' }} />
            </FormItem>
          )}

          {visibleFields.includes('default_cfg_scale') && (
            <FormItem label="默认 CFG" field="default_cfg_scale">
              <InputNumber min={1} max={30} step={0.5} placeholder="7.0" style={{ width: '100%' }} />
            </FormItem>
          )}

          {visibleFields.includes('default_width') && (
            <FormItem label="默认宽度" field="default_width">
              <InputNumber min={256} max={2048} step={64} placeholder="1024" style={{ width: '100%' }} />
            </FormItem>
          )}

          {visibleFields.includes('default_height') && (
            <FormItem label="默认高度" field="default_height">
              <InputNumber min={256} max={2048} step={64} placeholder="1024" style={{ width: '100%' }} />
            </FormItem>
          )}

          {visibleFields.includes('workflow_template') && (
            <FormItem label="工作流模板" field="workflow_template">
              <Input placeholder="ComfyUI 工作流模板 ID" />
            </FormItem>
          )}

          <FormItem label="超时时间（秒）" field="timeout" initialValue={300}>
            <InputNumber min={10} max={3600} style={{ width: '100%' }} />
          </FormItem>

          <FormItem label="设为默认" field="is_default" triggerPropName="checked">
            <Switch />
          </FormItem>

          <FormItem label="启用" field="is_enabled" triggerPropName="checked" initialValue={true}>
            <Switch />
          </FormItem>
        </Form>
      </Modal>
    </div>
  )
}
