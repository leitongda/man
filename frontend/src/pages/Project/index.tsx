import { useParams } from 'react-router-dom'
import { Card, Typography, Grid, Steps, Button, Space } from '@arco-design/web-react'
import {
  IconBook,
  IconEdit,
  IconImage,
  IconFile,
  IconCheckCircle,
} from '@arco-design/web-react/icon'
import { useProjectStore } from '@/stores/project'

const { Title, Paragraph } = Typography
const { Row, Col } = Grid
const Step = Steps.Step

export default function ProjectPage() {
  const { id } = useParams()
  const { projects } = useProjectStore()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return <div>项目不存在</div>
  }

  const pipelineSteps = [
    { title: '世界观建档', description: '生成StoryBible', icon: <IconBook /> },
    { title: '故事扩写', description: '生成大纲和节拍', icon: <IconEdit /> },
    { title: '分镜脚本', description: '生成Panel脚本', icon: <IconFile /> },
    { title: '一致性资产', description: '角色/场景设定图', icon: <IconImage /> },
    { title: '分镜出图', description: '生成漫画图像', icon: <IconImage /> },
    { title: '排版导出', description: '合成最终作品', icon: <IconCheckCircle /> },
  ]

  return (
    <div>
      <Card style={{ marginBottom: 24 }}>
        <Title heading={4}>{project.name}</Title>
        <Paragraph>{project.description}</Paragraph>
        <Space>
          <span>风格: {project.config.style}</span>
          <span>格式: {project.config.format}</span>
          <span>每章格数: {project.config.panels_per_chapter}</span>
        </Space>
      </Card>

      <Card title="生成流程" style={{ marginBottom: 24 }}>
        <Steps current={project.current_step || 0} style={{ marginBottom: 24 }}>
          {pipelineSteps.map((step, index) => (
            <Step key={index} title={step.title} description={step.description} />
          ))}
        </Steps>
        <Button type="primary" size="large">
          开始生成
        </Button>
      </Card>

      <Row gutter={24}>
        <Col span={8}>
          <Card title="角色" extra={<Button type="text">查看全部</Button>}>
            <Paragraph type="secondary">暂无角色</Paragraph>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="章节" extra={<Button type="text">查看全部</Button>}>
            <Paragraph type="secondary">暂无章节</Paragraph>
          </Card>
        </Col>
        <Col span={8}>
          <Card title="资产" extra={<Button type="text">查看全部</Button>}>
            <Paragraph type="secondary">暂无资产</Paragraph>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
