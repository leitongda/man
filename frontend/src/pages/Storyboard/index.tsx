/**
 * 分镜描述页面 - 章节 > 场景 > Panel 的树形结构
 */
import { useState, useEffect } from 'react'
import {
  Card,
  Typography,
  Button,
  Space,
  Empty,
  Spin,
  Message,
  Collapse,
  Tag,
  Descriptions,
  Select,
} from '@arco-design/web-react'
import { IconRobot, IconRefresh } from '@arco-design/web-react/icon'
import { useParams } from 'react-router-dom'
import { chapterApi, storyboardApi } from '@/services/api'
import { PageHeader, LoadingCenter, EmptyCenter } from '@/components/styled/common'
import {
  ChapterSelector, SceneParagraph, PanelCard,
  DialogueSection, DialogueDivider, DialogueTitle,
  DialogueLine, DialogueText,
} from './styles'

const { Title } = Typography
const CollapseItem = Collapse.Item

const cameraLabels: Record<string, string> = {
  wide: '远景',
  medium: '中景',
  close_up: '近景',
  extreme_close_up: '特写',
  bird_eye: '鸟瞰',
  worm_eye: '仰视',
}


export default function StoryboardPage() {
  const { id: projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [chapters, setChapters] = useState<any[]>([])
  const [selectedChapter, setSelectedChapter] = useState<string>('')
  const [storyboard, setStoryboard] = useState<any>(null)
  const [sbLoading, setSbLoading] = useState(false)

  useEffect(() => {
    if (projectId) loadChapters()
  }, [projectId])

  const loadChapters = async () => {
    setLoading(true)
    try {
      const data = await chapterApi.list(projectId!) as any
      const list = Array.isArray(data) ? data : []
      setChapters(list)
      if (list.length > 0) {
        setSelectedChapter(list[0].id)
        loadStoryboard(list[0].id)
      }
    } catch {
      setChapters([])
    } finally {
      setLoading(false)
    }
  }

  const loadStoryboard = async (chapterId: string) => {
    setSbLoading(true)
    try {
      const data = await storyboardApi.get(projectId!, chapterId) as any
      setStoryboard(data)
    } catch {
      setStoryboard(null)
    } finally {
      setSbLoading(false)
    }
  }

  const handleChapterChange = (chapterId: string) => {
    setSelectedChapter(chapterId)
    loadStoryboard(chapterId)
  }

  const handleGenerate = async () => {
    if (!selectedChapter) {
      Message.warning('请先选择章节')
      return
    }
    try {
      await storyboardApi.generate(projectId!, selectedChapter)
      Message.info('AI 分镜生成功能待实现')
    } catch {
      Message.error('生成失败')
    }
  }

  if (loading) {
    return <LoadingCenter><Spin size={32} /></LoadingCenter>
  }

  const scenes = storyboard?.scenes || []

  return (
    <div>
      <PageHeader>
        <Title heading={4}>分镜描述</Title>
        <Space>
          <Button icon={<IconRobot />} onClick={handleGenerate}>AI 生成分镜</Button>
        </Space>
      </PageHeader>

      {chapters.length === 0 ? (
        <Card>
          <Empty description="暂无章节，请先在「章节管理」页面创建章节" />
        </Card>
      ) : (
        <>
          {/* 章节选择器 */}
          <ChapterSelector>
            <Space>
              <span>选择章节：</span>
              <Select
                value={selectedChapter}
                onChange={handleChapterChange}
                style={{ width: 300 }}
              >
                {chapters.map((ch: any) => (
                  <Select.Option key={ch.id} value={ch.id}>
                    第{ch.order}章: {ch.title}
                  </Select.Option>
                ))}
              </Select>
              <Button icon={<IconRefresh />} onClick={() => loadStoryboard(selectedChapter)}>
                刷新
              </Button>
            </Space>
          </ChapterSelector>

          {/* 分镜内容 */}
          {sbLoading ? (
            <EmptyCenter><Spin /></EmptyCenter>
          ) : scenes.length > 0 ? (
            <Collapse defaultActiveKey={scenes.map((_: any, i: number) => String(i))}>
              {scenes.map((scene: any, sceneIdx: number) => (
                <CollapseItem
                  key={String(sceneIdx)}
                  name={String(sceneIdx)}
                  header={
                    <Space>
                      <Tag color="arcoblue">场景 {sceneIdx + 1}</Tag>
                      <span>{scene.location}</span>
                      <Tag size="small">{scene.mood}</Tag>
                    </Space>
                  }
                >
                  <SceneParagraph type="secondary">
                    {scene.purpose}
                  </SceneParagraph>

                  {scene.panels?.length > 0 ? (
                    scene.panels.map((panel: any) => (
                      <PanelCard
                        key={panel.id}
                        size="small"
                        title={
                          <Space>
                            <Tag>Panel #{panel.order}</Tag>
                            <Tag size="small" color="cyan">
                              {cameraLabels[panel.camera] || panel.camera}
                            </Tag>
                          </Space>
                        }
                      >
                        <Descriptions
                          column={2}
                          size="small"
                          data={[
                            { label: '动作', value: panel.action || '-' },
                            { label: '表情', value: panel.expression || '-' },
                            { label: '地点', value: panel.location || '-' },
                            { label: '时间', value: panel.time || '-' },
                            { label: '构图', value: panel.composition || '-' },
                            { label: '连续性', value: panel.continuity_notes || '-' },
                          ]}
                        />
                        {panel.dialogue?.length > 0 && (
                          <DialogueSection>
                            <DialogueDivider />
                            <DialogueTitle heading={6}>对话</DialogueTitle>
                            {panel.dialogue.map((d: any, di: number) => (
                              <DialogueLine key={di}>
                                <Tag size="small">{d.type}</Tag>
                                <DialogueText>{d.text}</DialogueText>
                              </DialogueLine>
                            ))}
                          </DialogueSection>
                        )}
                      </PanelCard>
                    ))
                  ) : (
                    <Empty description="此场景暂无分镜" />
                  )}
                </CollapseItem>
              ))}
            </Collapse>
          ) : (
            <Card>
              <Empty description="此章节暂无分镜，点击 AI 生成" />
            </Card>
          )}
        </>
      )}
    </div>
  )
}
