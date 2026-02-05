import { useState } from 'react'
import {
  Modal,
  Steps,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  Typography,
  Card,
} from '@arco-design/web-react'
import type { ProjectConfig } from '@/types/project'

const { Step } = Steps
const { TextArea } = Input
const { Title, Paragraph } = Typography

interface CreateWizardProps {
  visible: boolean
  onClose: () => void
  onSubmit: (name: string, description: string, config: ProjectConfig) => void
}

export default function CreateWizard({ visible, onClose, onSubmit }: CreateWizardProps) {
  const [current, setCurrent] = useState(0)
  const [form] = Form.useForm()

  const steps = [
    { title: '故事输入', description: '输入故事梗概' },
    { title: '风格设置', description: '选择漫画风格' },
    { title: '高级配置', description: '详细参数设置' },
  ]

  const handleNext = async () => {
    try {
      await form.validate()
      if (current < steps.length - 1) {
        setCurrent(current + 1)
      } else {
        handleSubmit()
      }
    } catch (e) {
      console.error('Validation failed:', e)
    }
  }

  const handlePrev = () => {
    if (current > 0) {
      setCurrent(current - 1)
    }
  }

  const handleSubmit = () => {
    const values = form.getFieldsValue()
    const config: ProjectConfig = {
      style: values.style || 'manga',
      format: values.format || 'webtoon_vertical',
      panels_per_chapter: values.panels_per_chapter || 12,
      max_characters: values.max_characters || 5,
      content_rating: values.content_rating || 'all_ages',
      tone: values.tone || 'comedy',
      language: 'zh-CN',
    }
    onSubmit(values.name, values.description, config)
    form.resetFields()
    setCurrent(0)
  }

  const renderStep = () => {
    switch (current) {
      case 0:
        return (
          <div>
            <Form.Item
              label="项目名称"
              field="name"
              rules={[{ required: true, message: '请输入项目名称' }]}
            >
              <Input placeholder="给你的漫画起个名字" />
            </Form.Item>
            <Form.Item
              label="故事梗概"
              field="description"
              rules={[{ required: true, message: '请输入故事梗概' }]}
            >
              <TextArea
                placeholder="用一句话或几句话描述你的故事...&#10;&#10;例如：一个普通高中生意外获得了读心术，却发现自己暗恋的女生其实一直在想着另一个人..."
                rows={6}
              />
            </Form.Item>
            <Card style={{ background: 'var(--color-fill-2)' }}>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                提示：故事梗概越详细，AI生成的内容质量越高。可以包含：
                <ul style={{ marginTop: 8 }}>
                  <li>主角设定和目标</li>
                  <li>核心冲突和挑战</li>
                  <li>故事背景（时代、地点）</li>
                  <li>期望的结局走向</li>
                </ul>
              </Paragraph>
            </Card>
          </div>
        )
      case 1:
        return (
          <div>
            <Form.Item
              label="漫画风格"
              field="style"
              initialValue="manga"
            >
              <Select>
                <Select.Option value="manga">日漫风格</Select.Option>
                <Select.Option value="manhua">国漫风格</Select.Option>
                <Select.Option value="webtoon">韩漫/条漫风格</Select.Option>
                <Select.Option value="american">美漫风格</Select.Option>
                <Select.Option value="realistic">写实风格</Select.Option>
                <Select.Option value="watercolor">水彩风格</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="画幅格式"
              field="format"
              initialValue="webtoon_vertical"
            >
              <Select>
                <Select.Option value="webtoon_vertical">竖屏条漫（适合手机阅读）</Select.Option>
                <Select.Option value="a4_page">A4页漫（适合印刷）</Select.Option>
                <Select.Option value="custom">自定义</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item
              label="故事基调"
              field="tone"
              initialValue="comedy"
            >
              <Select>
                <Select.Option value="comedy">轻松搞笑</Select.Option>
                <Select.Option value="serious">严肃正剧</Select.Option>
                <Select.Option value="suspense">悬疑惊悚</Select.Option>
                <Select.Option value="romance">浪漫爱情</Select.Option>
                <Select.Option value="action">热血动作</Select.Option>
              </Select>
            </Form.Item>
          </div>
        )
      case 2:
        return (
          <div>
            <Form.Item
              label="每章格数"
              field="panels_per_chapter"
              initialValue={12}
              extra="建议8-20格，格数越多内容越丰富"
            >
              <InputNumber min={4} max={50} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="角色数量上限"
              field="max_characters"
              initialValue={5}
              extra="角色越少，一致性越容易保持"
            >
              <InputNumber min={1} max={10} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              label="内容分级"
              field="content_rating"
              initialValue="all_ages"
            >
              <Select>
                <Select.Option value="all_ages">全年龄</Select.Option>
                <Select.Option value="teen">青少年（13+）</Select.Option>
                <Select.Option value="mature">成人（18+）</Select.Option>
              </Select>
            </Form.Item>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <Modal
      title="创建新漫画项目"
      visible={visible}
      onCancel={onClose}
      style={{ width: 700 }}
      footer={
        <Space>
          {current > 0 && (
            <Button onClick={handlePrev}>上一步</Button>
          )}
          <Button type="primary" onClick={handleNext}>
            {current === steps.length - 1 ? '开始创作' : '下一步'}
          </Button>
        </Space>
      }
    >
      <Steps current={current} style={{ marginBottom: 24 }}>
        {steps.map((step, index) => (
          <Step key={index} title={step.title} description={step.description} />
        ))}
      </Steps>
      
      <Form form={form} layout="vertical">
        {renderStep()}
      </Form>
    </Modal>
  )
}
