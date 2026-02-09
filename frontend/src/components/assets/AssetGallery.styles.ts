import styled from 'styled-components'
import { Card, Image, Space } from '@arco-design/web-react'

export const FilterCard = styled(Card)`margin-bottom: 16px;`

export const FilterBar = styled(Space)`
  && { width: 100%; justify-content: space-between; }
`

export const CoverWrapper = styled.div`
  height: 180px;
  overflow: hidden;
  background: var(--color-fill-2);
`

export const CoverImage = styled(Image)`
  && { width: 100%; height: 100%; object-fit: cover; }
`

export const FileName = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

export const PreviewImage = styled(Image)`&& { max-height: 80vh; }`
