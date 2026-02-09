import styled from 'styled-components'
import { Typography } from '@arco-design/web-react'

const { Title } = Typography

export const PageHeaderRow = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

export const HeaderTitle = styled(Title)`&& { margin: 0; }`
