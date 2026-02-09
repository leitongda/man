/**
 * 大纲/故事线页面
 */
import { useState, useEffect } from 'react'
import {
  Card,
  Typography,
  Button,
  Space,
  Input,
  Form,
  Message,
  Spin,
  Divider,
  Tag,
  Empty,
} from '@arco-design/web-react'
import { IconRobot, IconImport, IconSave } from '@arco-design/web-react/icon'
import { useParams } from 'react-router-dom'
import { storyApi } from '@/services/api'
import { presetApi } from '@/services/preset'
import { PageHeader, LoadingCenter, SectionBlock } from '@/components/styled/common'
import { StorylineCard, BeatDescription } from './styles'

const { Title, Paragraph } = Typography
const FormItem = Form.Item

export default function OutlinePage() {
  const { id: projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [outline, setOutline] = useState<any>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!projectId) return
    loadOutline()
  }, [projectId])

  const loadOutline = async () => {
    setLoading(true)
    try {
      const data = await storyApi.getOutline(projectId!) as any
      setOutline(data)
      form.setFieldsValue({
        synopsis_short: data.synopsis_short || '',
        synopsis_mid: data.synopsis_mid || '',
        synopsis_long: data.synopsis_long || '',
      })
    } catch {
      // 新项目可能还没有大纲
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validate()
      setSaving(true)
      await storyApi.updateOutline(projectId!, {
        synopsis_short: values.synopsis_short,
        synopsis_mid: values.synopsis_mid,
        synopsis_long: values.synopsis_long,
      })
      Message.success('大纲已保存')
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail) Message.error(detail)
    } finally {
      setSaving(false)
    }
  }

  const handleGenerate = async () => {
    try {
      await storyApi.generate(projectId!)
      Message.info('AI生成功能待实现，请手动编辑')
    } catch {
      Message.error('生成失败')
    }
  }

  const handleSaveAsPreset = async () => {
    const values = form.getFieldsValue()
    try {
      await presetApi.create({
        type: 'world',
        name: `大纲预设 - ${new Date().toLocaleDateString()}`,
        description: values.synopsis_short || '从项目导出的大纲',
        data: {
          synopsis_short: values.synopsis_short,
          synopsis_mid: values.synopsis_mid,
          synopsis_long: values.synopsis_long,
        },
      })
      Message.success('已保存为预设')
    } catch {
      Message.error('保存预设失败')
    }
  }

  if (loading) {
    return <LoadingCenter><Spin size={32} /></LoadingCenter>
  }

  return (
    <div>
      <PageHeader>
        <Title heading={4}>大纲 / 故事线</Title>
        <Space>
          <Button icon={<IconRobot />} onClick={handleGenerate}>AI 生成</Button>
          <Button icon={<IconImport />} onClick={handleSaveAsPreset}>保存为预设</Button>
          <Button type="primary" icon={<IconSave />} loading={saving} onClick={handleSave}>
            保存
          </Button>
        </Space>
      </PageHeader>

      <Card>
        <Form form={form} layout="vertical">
          <FormItem label="一句话梗概" field="synopsis_short">
            <Input.TextArea placeholder="用一句话概括故事..." rows={2} />
          </FormItem>

          <FormItem label="中篇摘要" field="synopsis_mid">
            <Input.TextArea placeholder="100-300字的故事摘要..." rows={5} />
          </FormItem>

          <FormItem label="完整大纲" field="synopsis_long">
            <Input.TextArea placeholder="详细的故事大纲，包含主要情节转折..." rows={10} />
          </FormItem>
        </Form>
      </Card>

      <Divider />

      <Card title="关键节拍 (Key Beats)">
        {outline?.key_beats?.length > 0 ? (
          <div>
            {outline.key_beats.map((beat: any, index: number) => (
              <SectionBlock key={beat.id || index}>
                <Space>
                  <Tag color="arcoblue">#{index + 1}</Tag>
                  <Tag>{beat.type}</Tag>
                </Space>
                <BeatDescription>{beat.description}</BeatDescription>
              </SectionBlock>
            ))}
          </div>
        ) : (
          <Empty description="暂无节拍，可通过 AI 生成或手动添加" />
        )}
      </Card>

      <StorylineCard title="故事线 (Storylines)">
        {outline?.storylines?.length > 0 ? (
          <div>
            {outline.storylines.map((line: any, index: number) => (
              <SectionBlock key={line.id || index}>
                <Title heading={6}>{line.name}</Title>
                <Paragraph type="secondary">{line.description}</Paragraph>
              </SectionBlock>
            ))}
          </div>
        ) : (
          <Empty description="暂无故事线" />
        )}
      </StorylineCard>
    </div>
  )
}
