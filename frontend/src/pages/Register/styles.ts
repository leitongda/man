import styled from 'styled-components'
import { Card, Button, Typography } from '@arco-design/web-react'

const { Title } = Typography

export const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`

export const RegisterCard = styled(Card)`
  width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border-radius: 12px;
`

export const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`

export const StyledTitle = styled(Title)`
  && { margin: 0 0 8px 0; }
`

export const SubmitButton = styled(Button)`
  && { height: 40px; }
`

export const FooterWrap = styled.div`
  text-align: center;
`

export const FooterHint = styled.span`
  color: var(--color-text-3);
`
