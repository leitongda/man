import styled from 'styled-components'
import { Card, Image, Typography } from '@arco-design/web-react'

const { Paragraph } = Typography

export const ChapterCard = styled(Card)`margin-bottom: 16px;`

export const ImagePlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 3 / 4;
  background: var(--color-fill-2);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  overflow: hidden;
`

export const PanelImage = styled(Image)`&& { object-fit: cover; }`
export const PanelInfo = styled.div`display: flex; justify-content: space-between; align-items: center;`
export const PanelAction = styled(Paragraph)`&& { margin: 4px 0 0; font-size: 12px; }`
