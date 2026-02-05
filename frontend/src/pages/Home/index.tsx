import { useState } from 'react'
import {
  Card,
  Button,
  Typography,
  Grid,
  Space,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
} from '@arco-design/web-react'
import { IconPlus, IconBook, IconImage } from '@arco-design/web-react/icon'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/project'
import type { ProjectConfig } from '@/types/project'

const { Title, Paragraph } = Typography
const { Row, Col } = Grid
const FormItem = Form.Item

export default function HomePage() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()
  const { projects, createProject } = useProjectStore()

  const handleCreate = async () => {
    try {
      const values = await form.validate()
      const project = await createProject(values.name, values.description, values.config)
      setVisible(false)
      form.resetFields()
      navigate(`/project/${project.id}`)
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title heading={3}>AI漫画生成系统</Title>
        <Paragraph>
          从一句话开始，生成完整的漫画作品。支持故事扩写、世界观建档、分镜脚本、角色一致性、图像生成和排版合成。
        </Paragraph>
      </div>

      <Row gutter={24}>
        <Col span={8}>
          <Card
            hoverable
            style={{ cursor: 'pointer' }}
            onClick={() => setVisible(true)}
          >
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <IconPlus style={{ fontSize: 48, color: 'var(--color-primary)' }} />
              <Title heading={5} style={{ marginTop: 16 }}>
                创建新项目
              </Title>
              <Paragraph type="secondary">
                输入故事梗概，开始创作漫画
              </Paragraph>
            </div>
          </Card>
        </Col>

        {projects.map((project) => (
          <Col span={8} key={project.id}>
            <Card
              hoverable
              style={{ cursor: 'pointer' }}
              onClick={() => navigate(`/project/${project.id}`)}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconBook style={{ fontSize: 24 }} />
                  <Title heading={5} style={{ margin: 0 }}>
                    {project.name}
                  </Title>
                </div>
                <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                  {project.description || '暂无描述'}
                </Paragraph>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-3)' }}>
                    {project.config.style}
                  </span>
                  <span style={{ color: 'var(--color-text-3)' }}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title="创建新项目"
        visible={visible}
        onOk={handleCreate}
        onCancel={() => setVisible(false)}
        style={{ width: 600 }}
      >
        <Form form={form} layout="vertical">
          <FormItem label="项目名称" field="name" rules={[{ required: true }]}>
            <Input placeholder="输入项目名称" />
          </FormItem>
          <FormItem label="故事梗概" field="description">
            <Input.TextArea
              placeholder="输入一句话或几句话描述你的故事..."
              rows={4}
            />
          </FormItem>
          <FormItem label="漫画风格" field="config.style" initialValue="manga">
            <Select>
              <Select.Option value="manga">日漫</Select.Option>
              <Select.Option value="manhua">国漫</Select.Option>
              <Select.Option value="webtoon">条漫</Select.Option>
              <Select.Option value="american">美漫</Select.Option>
              <Select.Option value="realistic">写实</Select.Option>
              <Select.Option value="watercolor">水彩</Select.Option>
            </Select>
          </FormItem>
          <FormItem label="画幅格式" field="config.format" initialValue="webtoon_vertical">
            <Select>
              <Select.Option value="webtoon_vertical">竖屏条漫</Select.Option>
              <Select.Option value="a4_page">A4页漫</Select.Option>
              <Select.Option value="custom">自定义</Select.Option>
            </Select>
          </FormItem>
          <FormItem label="每章格数" field="config.panels_per_chapter" initialValue={12}>
            <InputNumber min={4} max={50} />
          </FormItem>
          <FormItem label="内容分级" field="config.content_rating" initialValue="all_ages">
            <Select>
              <Select.Option value="all_ages">全年龄</Select.Option>
              <Select.Option value="teen">青少年</Select.Option>
              <Select.Option value="mature">成人</Select.Option>
            </Select>
          </FormItem>
          <FormItem label="故事基调" field="config.tone" initialValue="comedy">
            <Select>
              <Select.Option value="comedy">搞笑</Select.Option>
              <Select.Option value="serious">严肃</Select.Option>
              <Select.Option value="suspense">悬疑</Select.Option>
              <Select.Option value="romance">浪漫</Select.Option>
              <Select.Option value="action">动作</Select.Option>
            </Select>
          </FormItem>
        </Form>
      </Modal>
    </div>
  )
}
