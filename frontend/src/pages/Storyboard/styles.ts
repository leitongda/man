import styled from 'styled-components'
import { Card, Typography, Divider } from '@arco-design/web-react'

const { Title, Paragraph } = Typography

export const ChapterSelector = styled(Card)`margin-bottom: 16px;`
export const SceneParagraph = styled(Paragraph)`&& { margin-bottom: 12px; }`
export const PanelCard = styled(Card)`margin-bottom: 8px;`
export const DialogueSection = styled.div`margin-top: 8px;`
export const DialogueDivider = styled(Divider)`&& { margin: 8px 0; }`
export const DialogueTitle = styled(Title)`&& { font-size: 13px; }`
export const DialogueLine = styled.div`margin-bottom: 4px;`
export const DialogueText = styled.span`margin-left: 4px;`
