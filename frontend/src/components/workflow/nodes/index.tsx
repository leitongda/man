import { memo } from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Tag, Typography } from '@arco-design/web-react'
import {
  IconEdit,
  IconImage,
  IconFile,
  IconUser,
  IconSettings,
  IconPlayArrow,
} from '@arco-design/web-react/icon'
import { BaseNodeCard, NodeTitleRow } from './styles'

const { Text } = Typography

// 输入节点
export const InputNode = memo(({ data }: NodeProps) => {
  return (
    <BaseNodeCard
      size="small"
      $borderColor="#165DFF"
      title={
        <NodeTitleRow>
          <IconEdit style={{ color: '#165DFF' }} />
          <Text>{data.label}</Text>
        </NodeTitleRow>
      }
    >
      <Tag color="arcoblue">输入</Tag>
      <Handle type="source" position={Position.Bottom} />
    </BaseNodeCard>
  )
})

// AI处理节点
export const AINode = memo(({ data }: NodeProps) => {
  return (
    <BaseNodeCard
      size="small"
      $borderColor="#722ED1"
      title={
        <NodeTitleRow>
          <IconPlayArrow style={{ color: '#722ED1' }} />
          <Text>{data.label}</Text>
        </NodeTitleRow>
      }
    >
      <Tag color="purple">{data.model || 'GPT-4'}</Tag>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </BaseNodeCard>
  )
})

// 图像生成节点
export const ImageGenNode = memo(({ data }: NodeProps) => {
  return (
    <BaseNodeCard
      size="small"
      $borderColor="#F77234"
      title={
        <NodeTitleRow>
          <IconImage style={{ color: '#F77234' }} />
          <Text>{data.label}</Text>
        </NodeTitleRow>
      }
    >
      <Tag color="orange">{data.model || 'SD'}</Tag>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </BaseNodeCard>
  )
})

// 角色引用节点
export const CharacterRefNode = memo(({ data }: NodeProps) => {
  return (
    <BaseNodeCard
      size="small"
      $borderColor="#00B42A"
      title={
        <NodeTitleRow>
          <IconUser style={{ color: '#00B42A' }} />
          <Text>{data.label}</Text>
        </NodeTitleRow>
      }
    >
      {data.characterName && <Tag color="green">{data.characterName}</Tag>}
      <Handle type="source" position={Position.Bottom} />
    </BaseNodeCard>
  )
})

// 输出节点
export const OutputNode = memo(({ data }: NodeProps) => {
  return (
    <BaseNodeCard
      size="small"
      $borderColor="#14C9C9"
      title={
        <NodeTitleRow>
          <IconFile style={{ color: '#14C9C9' }} />
          <Text>{data.label}</Text>
        </NodeTitleRow>
      }
    >
      <Tag color="cyan">输出</Tag>
      <Handle type="target" position={Position.Top} />
    </BaseNodeCard>
  )
})

// 配置节点
export const ConfigNode = memo(({ data }: NodeProps) => {
  return (
    <BaseNodeCard
      size="small"
      $borderColor="#86909C"
      title={
        <NodeTitleRow>
          <IconSettings style={{ color: '#86909C' }} />
          <Text>{data.label}</Text>
        </NodeTitleRow>
      }
    >
      <Tag>配置</Tag>
      <Handle type="source" position={Position.Bottom} />
    </BaseNodeCard>
  )
})

// 节点类型映射
export const nodeTypes = {
  input: InputNode,
  ai: AINode,
  imageGen: ImageGenNode,
  characterRef: CharacterRefNode,
  output: OutputNode,
  config: ConfigNode,
}

// 预设节点模板
export const nodeTemplates = [
  {
    type: 'input',
    label: '故事输入',
    description: '输入故事梗概',
  },
  {
    type: 'ai',
    label: '世界观建档',
    description: '生成Story Bible',
    data: { model: 'GPT-4' },
  },
  {
    type: 'ai',
    label: '故事扩写',
    description: '扩展故事内容',
    data: { model: 'Claude' },
  },
  {
    type: 'ai',
    label: '分镜脚本',
    description: '生成Panel脚本',
    data: { model: 'GPT-4' },
  },
  {
    type: 'characterRef',
    label: '角色参考',
    description: '角色设定图引用',
  },
  {
    type: 'imageGen',
    label: '草稿生成',
    description: '生成黑白草稿',
    data: { model: 'SD' },
  },
  {
    type: 'imageGen',
    label: '成稿生成',
    description: '生成彩色成稿',
    data: { model: 'SD' },
  },
  {
    type: 'ai',
    label: '排版合成',
    description: '合成最终页面',
  },
  {
    type: 'output',
    label: '漫画输出',
    description: '导出最终作品',
  },
]
