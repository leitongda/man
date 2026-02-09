import { useState } from 'react'
import {
  Card,
  Grid,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Empty,
  Modal,
  Upload,
  Message,
} from '@arco-design/web-react'
import {
  IconSearch,
  IconUpload,
  IconDelete,
  IconDownload,
  IconEye,
} from '@arco-design/web-react/icon'
import { SecondaryText } from '@/components/styled/common'
import { FilterCard, FilterBar, CoverWrapper, CoverImage, FileName, PreviewImage } from './AssetGallery.styles'

const { Row, Col } = Grid

interface Asset {
  id: string
  type: 'character' | 'environment' | 'panel' | 'page'
  filename: string
  path: string
  thumbnail?: string
  created_at: string
  tags?: string[]
}

interface AssetGalleryProps {
  assets: Asset[]
  onUpload: (file: File, type: string) => Promise<void>
  onDelete: (assetId: string) => void
  onDownload: (assetId: string) => void
}

const typeLabels: Record<string, string> = {
  character: '角色',
  environment: '场景',
  panel: '分镜',
  page: '成品页',
}

const typeColors: Record<string, string> = {
  character: 'arcoblue',
  environment: 'green',
  panel: 'orange',
  page: 'purple',
}


export default function AssetGallery({
  assets,
  onUpload,
  onDelete,
  onDownload,
}: AssetGalleryProps) {
  const [searchText, setSearchText] = useState('')
  const [filterType, setFilterType] = useState<string>('')
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewAsset, setPreviewAsset] = useState<Asset | null>(null)
  const [uploadType, setUploadType] = useState<string>('character')

  const filteredAssets = assets.filter((asset) => {
    const matchSearch = !searchText || 
      asset.filename.toLowerCase().includes(searchText.toLowerCase()) ||
      asset.tags?.some((tag) => tag.toLowerCase().includes(searchText.toLowerCase()))
    const matchType = !filterType || asset.type === filterType
    return matchSearch && matchType
  })

  const handlePreview = (asset: Asset) => {
    setPreviewAsset(asset)
    setPreviewVisible(true)
  }

  const handleUpload = async (file: File) => {
    try {
      await onUpload(file, uploadType)
      Message.success('上传成功')
    } catch (e) {
      Message.error('上传失败')
    }
    return false // 阻止默认上传行为
  }

  const handleDelete = (asset: Asset) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除 "${asset.filename}" 吗？`,
      onOk: () => onDelete(asset.id),
    })
  }

  return (
    <div>
      <FilterCard>
        <FilterBar>
          <Space>
            <Input
              prefix={<IconSearch />}
              placeholder="搜索资产..."
              value={searchText}
              onChange={setSearchText}
              style={{ width: 200 }}
            />
            <Select
              placeholder="资产类型"
              value={filterType}
              onChange={setFilterType}
              allowClear
              style={{ width: 120 }}
            >
              <Select.Option value="character">角色</Select.Option>
              <Select.Option value="environment">场景</Select.Option>
              <Select.Option value="panel">分镜</Select.Option>
              <Select.Option value="page">成品页</Select.Option>
            </Select>
          </Space>
          <Space>
            <Select
              value={uploadType}
              onChange={setUploadType}
              style={{ width: 100 }}
            >
              <Select.Option value="character">角色</Select.Option>
              <Select.Option value="environment">场景</Select.Option>
              <Select.Option value="panel">分镜</Select.Option>
              <Select.Option value="page">成品页</Select.Option>
            </Select>
            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleUpload}
            >
              <Button type="primary" icon={<IconUpload />}>
                上传资产
              </Button>
            </Upload>
          </Space>
        </FilterBar>
      </FilterCard>

      {filteredAssets.length === 0 ? (
        <Card>
          <Empty description="暂无资产" />
        </Card>
      ) : (
        <Row gutter={[16, 16]}>
          {filteredAssets.map((asset) => (
            <Col span={6} key={asset.id}>
              <Card
                hoverable
                cover={
                  <CoverWrapper>
                    <CoverImage
                      src={asset.thumbnail || asset.path}
                      alt={asset.filename}
                      preview={false}
                      onClick={() => handlePreview(asset)}
                    />
                  </CoverWrapper>
                }
                actions={[
                  <Button
                    key="preview"
                    type="text"
                    icon={<IconEye />}
                    onClick={() => handlePreview(asset)}
                  />,
                  <Button
                    key="download"
                    type="text"
                    icon={<IconDownload />}
                    onClick={() => onDownload(asset.id)}
                  />,
                  <Button
                    key="delete"
                    type="text"
                    status="danger"
                    icon={<IconDelete />}
                    onClick={() => handleDelete(asset)}
                  />,
                ]}
              >
                <Card.Meta
                  title={
                    <FileName>
                      {asset.filename}
                    </FileName>
                  }
                  description={
                    <Space>
                      <Tag color={typeColors[asset.type]} size="small">
                        {typeLabels[asset.type]}
                      </Tag>
                      <SecondaryText>
                        {new Date(asset.created_at).toLocaleDateString()}
                      </SecondaryText>
                    </Space>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        style={{ width: 'auto', maxWidth: '90vw' }}
      >
        {previewAsset && (
          <PreviewImage
            src={previewAsset.path}
            alt={previewAsset.filename}
          />
        )}
      </Modal>
    </div>
  )
}
