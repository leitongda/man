/**
 * 项目概览页 - 展示各模块进度和快捷入口
 */
import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Grid, Steps, Tag, Spin } from '@arco-design/web-react'
import {
  IconBook,
  IconEdit,
  IconImage,
  IconFile,
  IconCheckCircle,
  IconList,
  IconCamera,
} from '@arco-design/web-react/icon'
import { useProjectStore } from '@/stores/project'
import { LoadingCenter } from '@/components/styled/common'
import {
  InfoCard, InfoHeader, TitleRow, ProjectTitle, TagRow,
  PipelineCard, StepsWrapper, ModuleCard, ModuleInner,
  ModuleIcon, ModuleContent, ModuleTitle, ModuleDesc, ArrowIcon,
} from './styles'

const { Paragraph } = Typography
const { Row, Col } = Grid
const Step = Steps.Step

const statusMap: Record<string, { text: string; color: string }> = {
  draft: { text: '草稿', color: 'gray' },
  in_progress: { text: '进行中', color: 'blue' },
  completed: { text: '已完成', color: 'green' },
}

const styleMap: Record<string, string> = {
  manga: '日漫', manhua: '国漫', webtoon: '条漫',
  american: '美漫', realistic: '写实', watercolor: '水彩',
}


export default function ProjectPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, fetchProjects } = useProjectStore()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (projects.length === 0) {
      setLoading(true)
      fetchProjects().finally(() => setLoading(false))
    }
  }, [])

  const project = projects.find((p) => p.id === id)

  if (loading) {
    return <LoadingCenter><Spin size={32} /></LoadingCenter>
  }

  if (!project) {
    return <LoadingCenter>项目不存在或加载中...</LoadingCenter>
  }

  const pipelineSteps = [
    { title: '大纲', description: '故事梗概和大纲', icon: <IconEdit /> },
    { title: '世界观', description: 'StoryBible建档', icon: <IconBook /> },
    { title: '章节', description: '章节规划', icon: <IconList /> },
    { title: '分镜脚本', description: 'Panel 脚本', icon: <IconFile /> },
    { title: '分镜出图', description: '生成漫画图像', icon: <IconCamera /> },
    { title: '排版导出', description: '合成最终作品', icon: <IconCheckCircle /> },
  ]

  const modules = [
    {
      title: '大纲 / 故事线',
      description: '管理故事梗概、摘要、关键节拍和故事线',
      icon: <IconEdit style={{ fontSize: 28 }} />,
      path: `/project/${id}/outline`,
    },
    {
      title: '章节管理',
      description: '创建和管理漫画章节',
      icon: <IconList style={{ fontSize: 28 }} />,
      path: `/project/${id}/chapters`,
    },
    {
      title: '世界观 (Story Bible)',
      description: '角色设定、世界观、风格指南、一致性规则',
      icon: <IconBook style={{ fontSize: 28 }} />,
      path: `/project/${id}/story-bible`,
    },
    {
      title: '分镜描述',
      description: '场景和分镜的脚本描述',
      icon: <IconFile style={{ fontSize: 28 }} />,
      path: `/project/${id}/storyboard`,
    },
    {
      title: '分镜出图',
      description: '查看和生成分镜图片',
      icon: <IconCamera style={{ fontSize: 28 }} />,
      path: `/project/${id}/panel-images`,
    },
    {
      title: '资产管理',
      description: '角色、场景、分镜、成品页图片资产',
      icon: <IconImage style={{ fontSize: 28 }} />,
      path: `/project/${id}/assets`,
    },
  ]

  return (
    <div>
      {/* 项目信息 */}
      <InfoCard>
        <InfoHeader>
          <div>
            <TitleRow align="center">
              <ProjectTitle heading={4}>{project.name}</ProjectTitle>
              <Tag color={statusMap[project.status]?.color}>
                {statusMap[project.status]?.text}
              </Tag>
            </TitleRow>
            <Paragraph type="secondary">{project.description || '暂无描述'}</Paragraph>
            <TagRow>
              <Tag>{styleMap[project.config.style] || project.config.style}</Tag>
              <Tag>每章 {project.config.panels_per_chapter} 格</Tag>
              <Tag>{project.config.format === 'webtoon_vertical' ? '竖屏条漫' : project.config.format === 'a4_page' ? 'A4页漫' : '自定义'}</Tag>
            </TagRow>
          </div>
        </InfoHeader>
      </InfoCard>

      {/* 生成流程 */}
      <PipelineCard title="生成流程">
        <StepsWrapper current={project.current_step || 0}>
          {pipelineSteps.map((step, index) => (
            <Step key={index} title={step.title} description={step.description} />
          ))}
        </StepsWrapper>
      </PipelineCard>

      {/* 模块入口卡片 */}
      <Row gutter={[16, 16]}>
        {modules.map((mod) => (
          <Col xs={24} sm={12} md={8} key={mod.path}>
            <ModuleCard
              hoverable
              onClick={() => navigate(mod.path)}
            >
              <ModuleInner>
                <ModuleIcon>{mod.icon}</ModuleIcon>
                <ModuleContent>
                  <ModuleTitle heading={6}>{mod.title}</ModuleTitle>
                  <ModuleDesc type="secondary">
                    {mod.description}
                  </ModuleDesc>
                </ModuleContent>
                <ArrowIcon />
              </ModuleInner>
            </ModuleCard>
          </Col>
        ))}
      </Row>
    </div>
  )
}
