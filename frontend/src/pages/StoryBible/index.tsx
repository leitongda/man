/**
 * 世界观 (Story Bible) 页面 - 完整编辑器
 */
import { useState, useEffect } from 'react'
import {
  Card,
  Typography,
  Tabs,
  Button,
  Empty,
  Space,
  Spin,
  Message,
  Modal,
  Table,
  Descriptions,
  Tag,
  List,
} from '@arco-design/web-react'
import { IconRobot, IconImport } from '@arco-design/web-react/icon'
import { useParams } from 'react-router-dom'
import { storyBibleApi } from '@/services/api'
import { presetApi } from '@/services/preset'
import { PageHeader, LoadingCenter, TabActionBar, EmptyCenter } from '@/components/styled/common'
import { CharacterCard, CharacterHeader } from './styles'
import type { Preset } from '@/types/preset'

const { Title } = Typography
const TabPane = Tabs.TabPane

export default function StoryBiblePage() {
  const { id: projectId } = useParams()
  const [loading, setLoading] = useState(true)
  const [storyBible, setStoryBible] = useState<any>(null)

  // 预设导入弹窗
  const [, setImportType] = useState<string>('')
  const [importVisible, setImportVisible] = useState(false)
  const [importPresets, setImportPresets] = useState<Preset[]>([])
  const [importLoading, setImportLoading] = useState(false)

  useEffect(() => {
    if (projectId) loadData()
  }, [projectId])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await storyBibleApi.get(projectId!) as any
      setStoryBible(data)
    } catch {
      setStoryBible(null)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    try {
      await storyBibleApi.generate(projectId!)
      Message.info('AI 世界观生成功能待实现')
    } catch {
      Message.error('生成失败')
    }
  }

  const handleOpenImport = async (type: string) => {
    setImportType(type)
    setImportVisible(true)
    setImportLoading(true)
    try {
      const res = await presetApi.list({ type, scope: 'all' })
      setImportPresets(res.items)
    } catch {
      setImportPresets([])
    } finally {
      setImportLoading(false)
    }
  }

  const handleImportPreset = async (presetId: string) => {
    try {
      await presetApi.importToProject(presetId, projectId!)
      Message.success('预设已导入')
      setImportVisible(false)
      loadData()
    } catch (error: any) {
      Message.error(error?.response?.data?.detail || '导入失败')
    }
  }

  const handleSaveAsPreset = async (type: string, name: string, data: any) => {
    try {
      await presetApi.create({
        type: type as any,
        name,
        description: `从项目导出`,
        data,
      })
      Message.success('已保存为预设')
    } catch {
      Message.error('保存预设失败')
    }
  }

  if (loading) {
    return <LoadingCenter><Spin size={32} /></LoadingCenter>
  }

  const characters = storyBible?.characters || []
  const world = storyBible?.world || {}
  const styleGuide = storyBible?.style_guide || {}
  const continuityRules = storyBible?.continuity_rules || []

  return (
    <div>
      <PageHeader>
        <Title heading={4}>世界观 (Story Bible)</Title>
        <Space>
          <Button icon={<IconRobot />} onClick={handleGenerate}>AI 生成</Button>
        </Space>
      </PageHeader>

      <Tabs defaultActiveTab="characters">
        {/* 角色设定 Tab */}
        <TabPane key="characters" title={`角色设定 (${characters.length})`}>
          <TabActionBar>
            <Space>
              <Button icon={<IconImport />} onClick={() => handleOpenImport('character')}>
                从预设导入
              </Button>
            </Space>
          </TabActionBar>
          {characters.length > 0 ? (
            <div>
              {characters.map((char: any) => (
                <CharacterCard key={char.id}>
                  <CharacterHeader>
                    <Title heading={6}>{char.name}</Title>
                    <Button
                      size="small"
                      type="text"
                      onClick={() => handleSaveAsPreset('character', char.name, char)}
                    >
                      保存为预设
                    </Button>
                  </CharacterHeader>
                  <Descriptions
                    column={2}
                    data={[
                      { label: '性格', value: char.personality || '-' },
                      { label: '说话风格', value: char.speech_pattern || '-' },
                      { label: '动机', value: char.motivation || '-' },
                      { label: '外貌', value: JSON.stringify(char.appearance || {}) },
                    ]}
                  />
                </CharacterCard>
              ))}
            </div>
          ) : (
            <Card><Empty description="暂无角色，使用 AI 生成或从预设导入" /></Card>
          )}
        </TabPane>

        {/* 世界观 Tab */}
        <TabPane key="world" title="世界观">
          <TabActionBar>
            <Space>
              <Button icon={<IconImport />} onClick={() => handleOpenImport('world')}>
                从预设导入
              </Button>
              {Object.keys(world).length > 0 && (
                <Button
                  type="text"
                  onClick={() => handleSaveAsPreset('world', '世界观设定', world)}
                >
                  保存为预设
                </Button>
              )}
            </Space>
          </TabActionBar>
          {Object.keys(world).length > 0 ? (
            <Card>
              <Descriptions
                column={1}
                data={[
                  { label: '时代', value: world.era || '-' },
                  { label: '地点', value: world.location || '-' },
                  { label: '技术水平', value: world.technology_level || '-' },
                  { label: '社会结构', value: world.social_structure || '-' },
                  { label: '规则', value: (world.rules || []).join('、') || '-' },
                ]}
              />
            </Card>
          ) : (
            <Card><Empty description="暂无世界观设定" /></Card>
          )}
        </TabPane>

        {/* 风格指南 Tab */}
        <TabPane key="style" title="风格指南">
          <TabActionBar>
            <Space>
              <Button icon={<IconImport />} onClick={() => handleOpenImport('style')}>
                从预设导入
              </Button>
              {Object.keys(styleGuide).length > 0 && (
                <Button
                  type="text"
                  onClick={() => handleSaveAsPreset('style', '风格指南', styleGuide)}
                >
                  保存为预设
                </Button>
              )}
            </Space>
          </TabActionBar>
          {Object.keys(styleGuide).length > 0 ? (
            <Card>
              <Descriptions
                column={1}
                data={[
                  { label: '画风', value: styleGuide.art_style || '-' },
                  { label: '线条', value: styleGuide.line_style || '-' },
                  { label: '上色', value: styleGuide.coloring || '-' },
                  { label: '纹理', value: styleGuide.texture || '-' },
                  { label: '镜头偏好', value: (styleGuide.camera_preferences || []).join('、') || '-' },
                ]}
              />
            </Card>
          ) : (
            <Card><Empty description="暂无风格指南" /></Card>
          )}
        </TabPane>

        {/* 一致性规则 Tab */}
        <TabPane key="continuity" title={`一致性规则 (${continuityRules.length})`}>
          {continuityRules.length > 0 ? (
            <List
              dataSource={continuityRules}
              render={(item: any, index: number) => (
                <List.Item key={index}>
                  <List.Item.Meta
                    title={item.subject}
                    description={item.rule}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Card><Empty description="暂无一致性规则" /></Card>
          )}
        </TabPane>
      </Tabs>

      {/* 预设导入弹窗 */}
      <Modal
        title={`从预设导入`}
        visible={importVisible}
        onCancel={() => setImportVisible(false)}
        footer={null}
        style={{ width: 640 }}
      >
        {importLoading ? (
          <EmptyCenter><Spin /></EmptyCenter>
        ) : importPresets.length > 0 ? (
          <Table
            columns={[
              { title: '名称', dataIndex: 'name' },
              { title: '描述', dataIndex: 'description', ellipsis: true },
              {
                title: '来源',
                dataIndex: 'is_public',
                width: 80,
                render: (v: boolean) => v ? <Tag color="green">公共</Tag> : <Tag>私有</Tag>,
              },
              {
                title: '操作',
                width: 80,
                render: (_: any, record: Preset) => (
                  <Button
                    type="primary"
                    size="small"
                    onClick={() => handleImportPreset(record.id)}
                  >
                    导入
                  </Button>
                ),
              },
            ]}
            data={importPresets}
            rowKey="id"
            pagination={false}
          />
        ) : (
          <Empty description="暂无可用预设" />
        )}
      </Modal>
    </div>
  )
}
