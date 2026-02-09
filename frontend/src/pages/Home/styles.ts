import styled from 'styled-components'
import { Card, Typography } from '@arco-design/web-react'
import { IconPlus } from '@arco-design/web-react/icon'

const { Title } = Typography

export const PageIntro = styled.div`
  margin-bottom: 24px;
`

export const CreateCardInner = styled.div`
  text-align: center;
  padding: 40px 0;
`

export const CreateIcon = styled(IconPlus)`
  font-size: 48px;
  color: var(--color-primary);
`

export const CreateTitle = styled(Title)`
  && { margin-top: 16px; }
`

export const ProjectCard = styled(Card)`
  cursor: pointer;
  height: 100%;
  min-height: 180px;
`

export const ProjectHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const ProjectTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`

export const ProjectFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`
