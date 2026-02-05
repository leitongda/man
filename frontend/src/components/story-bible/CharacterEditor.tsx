import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Space,
  Grid,
  Avatar,
  Tag,
  Descriptions,
  Modal,
  Upload,
  Image,
} from '@arco-design/web-react'
import { IconPlus, IconEdit, IconDelete, IconUpload } from '@arco-design/web-react/icon'
import type { Character } from '@/types/project'

const { Row, Col } = Grid
const { TextArea } = Input

interface CharacterEditorProps {
  characters: Character[]
  onChange: (characters: Character[]) => void
  onGenerateSheet: (characterId: string) => void
}

export default function CharacterEditor({
  characters,
  onChange,
  onGenerateSheet,
}: CharacterEditorProps) {
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [form] = Form.useForm()

  const handleAdd = () => {
    const newCharacter: Character = {
      id: `char_${Date.now()}`,
      name: '',
      appearance: {
        face: '',
        hair: '',
        body: '',
        clothing: [],
        accessories: [],
      },
      personality: '',
      speech_pattern: '',
      motivation: '',
      relationships: [],
      reference_images: [],
      prompt_fragments: [],
    }
    setEditingCharacter(newCharacter)
    form.setFieldsValue(newCharacter)
    setModalVisible(true)
  }

  const handleEdit = (character: Character) => {
    setEditingCharacter(character)
    form.setFieldsValue({
      ...character,
      clothing: character.appearance.clothing.join(', '),
      accessories: character.appearance.accessories.join(', '),
    })
    setModalVisible(true)
  }

  const handleDelete = (characterId: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个角色吗？',
      onOk: () => {
        onChange(characters.filter((c) => c.id !== characterId))
      },
    })
  }

  const handleSave = async () => {
    try {
      const values = await form.validate()
      const updatedCharacter: Character = {
        ...editingCharacter!,
        name: values.name,
        appearance: {
          face: values.face || '',
          hair: values.hair || '',
          body: values.body || '',
          clothing: values.clothing ? values.clothing.split(',').map((s: string) => s.trim()) : [],
          accessories: values.accessories ? values.accessories.split(',').map((s: string) => s.trim()) : [],
        },
        personality: values.personality || '',
        speech_pattern: values.speech_pattern || '',
        motivation: values.motivation || '',
      }

      const existingIndex = characters.findIndex((c) => c.id === updatedCharacter.id)
      if (existingIndex >= 0) {
        const newCharacters = [...characters]
        newCharacters[existingIndex] = updatedCharacter
        onChange(newCharacters)
      } else {
        onChange([...characters, updatedCharacter])
      }

      setModalVisible(false)
      setEditingCharacter(null)
      form.resetFields()
    } catch (e) {
      console.error('Validation failed:', e)
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="primary" icon={<IconPlus />} onClick={handleAdd}>
          添加角色
        </Button>
      </div>

      <Row gutter={16}>
        {characters.map((character) => (
          <Col span={8} key={character.id}>
            <Card
              hoverable
              style={{ marginBottom: 16 }}
              actions={[
                <Button
                  key="edit"
                  type="text"
                  icon={<IconEdit />}
                  onClick={() => handleEdit(character)}
                >
                  编辑
                </Button>,
                <Button
                  key="generate"
                  type="text"
                  onClick={() => onGenerateSheet(character.id)}
                >
                  生成设定图
                </Button>,
                <Button
                  key="delete"
                  type="text"
                  status="danger"
                  icon={<IconDelete />}
                  onClick={() => handleDelete(character.id)}
                />,
              ]}
            >
              <Card.Meta
                avatar={
                  character.reference_images.length > 0 ? (
                    <Image
                      width={60}
                      height={60}
                      src={character.reference_images[0]}
                      style={{ borderRadius: '50%' }}
                    />
                  ) : (
                    <Avatar size={60}>{character.name[0] || '?'}</Avatar>
                  )
                }
                title={character.name || '未命名角色'}
                description={
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>{character.personality || '暂无性格描述'}</div>
                    <Space wrap>
                      {character.appearance.hair && (
                        <Tag color="arcoblue">{character.appearance.hair}</Tag>
                      )}
                      {character.appearance.clothing.slice(0, 2).map((c, i) => (
                        <Tag key={i}>{c}</Tag>
                      ))}
                    </Space>
                  </Space>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={editingCharacter?.name ? `编辑角色: ${editingCharacter.name}` : '新建角色'}
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setEditingCharacter(null)
          form.resetFields()
        }}
        onOk={handleSave}
        style={{ width: 700 }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="角色名称"
            field="name"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="角色的名字" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="面部特征" field="face">
                <TextArea placeholder="描述面部特征，如：大眼睛、圆脸、有雀斑" rows={2} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="发型发色" field="hair">
                <TextArea placeholder="描述发型，如：黑色短发、马尾辫、刘海" rows={2} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="体型" field="body">
            <Input placeholder="如：高挑、娇小、健壮" />
          </Form.Item>

          <Form.Item label="服装" field="clothing" extra="多个服装用逗号分隔">
            <Input placeholder="如：校服、运动服、休闲装" />
          </Form.Item>

          <Form.Item label="配饰" field="accessories" extra="多个配饰用逗号分隔">
            <Input placeholder="如：眼镜、项链、耳环" />
          </Form.Item>

          <Form.Item label="性格特点" field="personality">
            <TextArea placeholder="描述性格，如：开朗活泼、内向害羞、傲娇" rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="口癖/说话习惯" field="speech_pattern">
                <Input placeholder="如：经常说'那个...'、喜欢用敬语" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="动机/目标" field="motivation">
                <Input placeholder="角色的核心动机或目标" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}
