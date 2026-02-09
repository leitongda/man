import styled from 'styled-components'
import { Card, Typography, Steps, Space } from '@arco-design/web-react'
import { IconArrowRight } from '@arco-design/web-react/icon'

const { Title, Paragraph } = Typography

export const InfoCard = styled(Card)`margin-bottom: 16px;`
export const InfoHeader = styled.div`display: flex; justify-content: space-between; align-items: flex-start;`
export const TitleRow = styled(Space)`&& { margin-bottom: 8px; }`
export const ProjectTitle = styled(Title)`&& { margin: 0; }`
export const TagRow = styled(Space)`&& { margin-top: 8px; }`
export const PipelineCard = styled(Card)`margin-bottom: 16px;`
export const StepsWrapper = styled(Steps)`&& { margin-bottom: 16px; }`
export const ModuleCard = styled(Card)`cursor: pointer;`
export const ModuleInner = styled.div`display: flex; align-items: center; gap: 12px;`
export const ModuleIcon = styled.div`color: var(--color-primary);`
export const ModuleContent = styled.div`flex: 1;`
export const ModuleTitle = styled(Title)`&& { margin: 0; }`
export const ModuleDesc = styled(Paragraph)`&& { margin: 4px 0 0; font-size: 13px; }`
export const ArrowIcon = styled(IconArrowRight)`color: var(--color-text-3);`
