import { useCallback, useState } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Panel,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Card,
  Button,
  Drawer,
  Space,
  Typography,
  List,
  Tag,
} from '@arco-design/web-react'
import { IconPlus, IconPlayArrow, IconSave } from '@arco-design/web-react/icon'
import { nodeTypes, nodeTemplates } from './nodes'

const { Title, Text } = Typography

interface WorkflowCanvasProps {
  initialNodes?: Node[]
  initialEdges?: Edge[]
  onSave?: (nodes: Node[], edges: Edge[]) => void
  onRun?: (nodes: Node[], edges: Edge[]) => void
}

// 默认漫画生成工作流
const defaultNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '故事输入' },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    type: 'ai',
    data: { label: '世界观建档', model: 'GPT-4' },
    position: { x: 250, y: 100 },
  },
  {
    id: '3',
    type: 'ai',
    data: { label: '故事扩写', model: 'Claude' },
    position: { x: 250, y: 200 },
  },
  {
    id: '4',
    type: 'ai',
    data: { label: '分镜脚本', model: 'GPT-4' },
    position: { x: 250, y: 300 },
  },
  {
    id: '5',
    type: 'characterRef',
    data: { label: '角色参考' },
    position: { x: 50, y: 400 },
  },
  {
    id: '6',
    type: 'imageGen',
    data: { label: '草稿生成', model: 'SD' },
    position: { x: 250, y: 400 },
  },
  {
    id: '7',
    type: 'imageGen',
    data: { label: '成稿生成', model: 'SD' },
    position: { x: 250, y: 500 },
  },
  {
    id: '8',
    type: 'output',
    data: { label: '漫画输出' },
    position: { x: 250, y: 600 },
  },
]

const defaultEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-6', source: '4', target: '6' },
  { id: 'e5-6', source: '5', target: '6' },
  { id: 'e6-7', source: '6', target: '7' },
  { id: 'e7-8', source: '7', target: '8' },
]

export default function WorkflowCanvas({
  initialNodes = defaultNodes,
  initialEdges = defaultEdges,
  onSave,
  onRun,
}: WorkflowCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [drawerVisible, setDrawerVisible] = useState(false)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const handleAddNode = (template: typeof nodeTemplates[0]) => {
    const newNode: Node = {
      id: `node_${Date.now()}`,
      type: template.type,
      data: {
        label: template.label,
        ...template.data,
      },
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 300 + 100,
      },
    }
    setNodes((nds) => [...nds, newNode])
    setDrawerVisible(false)
  }

  const handleSave = () => {
    onSave?.(nodes, edges)
  }

  const handleRun = () => {
    onRun?.(nodes, edges)
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
        
        <Panel position="top-right">
          <Space>
            <Button
              icon={<IconPlus />}
              onClick={() => setDrawerVisible(true)}
            >
              添加节点
            </Button>
            <Button icon={<IconSave />} onClick={handleSave}>
              保存
            </Button>
            <Button
              type="primary"
              icon={<IconPlayArrow />}
              onClick={handleRun}
            >
              运行
            </Button>
          </Space>
        </Panel>
      </ReactFlow>

      <Drawer
        title="添加节点"
        visible={drawerVisible}
        onCancel={() => setDrawerVisible(false)}
        width={350}
        footer={null}
      >
        <List
          dataSource={nodeTemplates}
          render={(item) => (
            <List.Item
              key={item.label}
              style={{ cursor: 'pointer' }}
              onClick={() => handleAddNode(item)}
            >
              <List.Item.Meta
                title={
                  <Space>
                    {item.label}
                    <Tag size="small">{item.type}</Tag>
                  </Space>
                }
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Drawer>
    </div>
  )
}
