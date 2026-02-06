import { useState, useEffect } from 'react'
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
  Message,
  Empty,
  Spin,
  Popconfirm,
  Tag,
} from '@arco-design/web-react'
import { IconPlus, IconBook, IconDelete } from '@arco-design/web-react/icon'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/project'
import type { ProjectConfig } from '@/types/project'

const { Title, Paragraph } = Typography
const { Row, Col } = Grid
const FormItem = Form.Item

const statusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'gray' },
  in_progress: { text: '进行中', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
}

const styleMap: Record<string, string> = {
  manga: '日漫',
  manhua: '国漫',
  webtoon: '条漫',
  american: '美漫',
  realistic: '写实',
  watercolor: '水彩',
}

export default function HomePage() {
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [form] = Form.useForm()
  const [createLoading, setCreateLoading] = useState(false)
  const { projects, loading, fetchProjects, createProject, deleteProject } = useProjectStore()

  // 页面加载时获取项目列表
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const handleCreate = async () => {
    try {
      const values = await form.validate()
      setCreateLoading(true)
      const project = await createProject(values.name, values.description, values.config || {})
      setVisible(false)
      form.resetFields()
      Message.success('项目创建成功')
      navigate(`/project/${project.id}`)
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail) {
        Message.error(detail)
      } else if (error?.errorFields) {
        // form validation error
      } else {
        Message.error('创建失败，请稍后重试')
      }
    } finally {
      setCreateLoading(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation()
    try {
      await deleteProject(projectId)
      Message.success('项目已删除')
    } catch (error) {
      Message.error('删除失败')
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <Spin size={32} tip="加载项目列表..." />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={8}>
            <Card
              hoverable
              style={{ cursor: 'pointer', height: '100%', minHeight: 180 }}
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
            <Col xs={24} sm={12} md={8} key={project.id}>
              <Card
                hoverable
                style={{ cursor: 'pointer', height: '100%', minHeight: 180 }}
                onClick={() => navigate(`/project/${project.id}`)}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                      <IconBook style={{ fontSize: 24 }} />
                      <Title heading={5} style={{ margin: 0 }} ellipsis>
                        {project.name}
                      </Title>
                    </div>
                    <Popconfirm
                      title="确定删除此项目？"
                      onOk={(e) => handleDelete(e as any, project.id)}
                    >
                      <Button
                        type="text"
                        size="small"
                        status="danger"
                        icon={<IconDelete />}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </Popconfirm>
                  </div>
                  <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                    {project.description || '暂无描述'}
                  </Paragraph>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space size={4}>
                      <Tag size="small">{styleMap[project.config.style] || project.config.style}</Tag>
                      <Tag size="small" color={statusMap[project.status]?.color}>
                        {statusMap[project.status]?.text || project.status}
                      </Tag>
                    </Space>
                    <span style={{ color: 'var(--color-text-3)', fontSize: 12 }}>
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}

          {projects.length === 0 && (
            <Col span={16}>
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <Empty description="还没有项目，点击上方创建你的第一个漫画项目" />
              </div>
            </Col>
          )}
        </Row>
      )}

      <Modal
        title="创建新项目"
        visible={visible}
        onOk={handleCreate}
        onCancel={() => setVisible(false)}
        confirmLoading={createLoading}
        style={{ width: 600 }}
      >
        <Form form={form} layout="vertical">
          <FormItem label="项目名称" field="name" rules={[{ required: true, message: '请输入项目名称' }]}>
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
