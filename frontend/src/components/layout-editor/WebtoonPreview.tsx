import { useState, useRef } from 'react'
import {
  Card,
  Button,
  Space,
  Slider,
  Typography,
  Image,
  Empty,
  Spin,
} from '@arco-design/web-react'
import {
  IconDownload,
  IconZoomIn,
  IconZoomOut,
  IconFullscreen,
} from '@arco-design/web-react/icon'

const { Title, Text } = Typography

interface WebtoonPreviewProps {
  images: string[]  // base64 images
  loading?: boolean
  onExport?: (format: 'png' | 'jpg' | 'pdf') => void
}

export default function WebtoonPreview({
  images,
  loading = false,
  onExport,
}: WebtoonPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = () => {
    setZoom(Math.min(200, zoom + 25))
  }

  const handleZoomOut = () => {
    setZoom(Math.max(25, zoom - 25))
  }

  const handleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen()
      } else {
        containerRef.current.requestFullscreen()
      }
    }
  }

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title heading={5} style={{ margin: 0 }}>预览</Title>
        <Space>
          <Button icon={<IconZoomOut />} onClick={handleZoomOut} />
          <Slider
            value={zoom}
            onChange={(v) => setZoom(v as number)}
            min={25}
            max={200}
            style={{ width: 100 }}
          />
          <Button icon={<IconZoomIn />} onClick={handleZoomIn} />
          <Button icon={<IconFullscreen />} onClick={handleFullscreen} />
          {onExport && (
            <Button.Group>
              <Button onClick={() => onExport('png')}>PNG</Button>
              <Button onClick={() => onExport('jpg')}>JPG</Button>
              <Button onClick={() => onExport('pdf')}>PDF</Button>
            </Button.Group>
          )}
        </Space>
      </div>

      <div
        ref={containerRef}
        style={{
          height: 600,
          overflow: 'auto',
          background: 'var(--color-fill-2)',
          borderRadius: 8,
          display: 'flex',
          justifyContent: 'center',
          padding: 20,
        }}
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Spin size={40} tip="生成中..." />
          </div>
        ) : images.length === 0 ? (
          <Empty description="暂无预览内容" />
        ) : (
          <div
            style={{
              width: `${zoom}%`,
              maxWidth: 800,
              transition: 'width 0.2s',
            }}
          >
            {images.map((img, index) => (
              <Image
                key={index}
                src={`data:image/png;base64,${img}`}
                alt={`Page ${index + 1}`}
                style={{
                  width: '100%',
                  display: 'block',
                  marginBottom: index < images.length - 1 ? 4 : 0,
                }}
                preview={false}
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
