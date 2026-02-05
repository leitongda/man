import { useCallback } from 'react'
import { Card, Typography, Button } from '@arco-design/web-react'
import { IconPlus, IconPlayArrow } from '@arco-design/web-react/icon'
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
} from 'reactflow'
import 'reactflow/dist/style.css'

const { Title } = Typography

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { label: '故事输入' },
    position: { x: 250, y: 0 },
  },
  {
    id: '2',
    data: { label: '世界观建档' },
    position: { x: 250, y: 100 },
  },
  {
    id: '3',
    data: { label: '故事扩写' },
    position: { x: 250, y: 200 },
  },
  {
    id: '4',
    data: { label: '分镜脚本' },
    position: { x: 250, y: 300 },
  },
  {
    id: '5',
    data: { label: '图像生成' },
    position: { x: 250, y: 400 },
  },
  {
    id: '6',
    type: 'output',
    data: { label: '漫画输出' },
    position: { x: 250, y: 500 },
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2' },
  { id: 'e2-3', source: '2', target: '3' },
  { id: 'e3-4', source: '3', target: '4' },
  { id: 'e4-5', source: '4', target: '5' },
  { id: 'e5-6', source: '5', target: '6' },
]

export default function WorkflowPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <Title heading={4}>工作流编辑器</Title>
        <div>
          <Button icon={<IconPlus />} style={{ marginRight: 8 }}>
            添加节点
          </Button>
          <Button type="primary" icon={<IconPlayArrow />}>
            运行工作流
          </Button>
        </div>
      </div>

      <Card bodyStyle={{ padding: 0 }}>
        <div style={{ height: 600 }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
          >
            <Controls />
            <MiniMap />
            <Background gap={12} size={1} />
          </ReactFlow>
        </div>
      </Card>
    </div>
  )
}
