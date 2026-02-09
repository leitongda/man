import styled from 'styled-components'
import { Card } from '@arco-design/web-react'

export const BaseNodeCard = styled(Card)<{ $borderColor: string }>`
  && {
    padding: 10px 15px;
    border-radius: 8px;
    min-width: 150px;
    border-color: ${(p) => p.$borderColor};
  }
`

export const NodeTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`
