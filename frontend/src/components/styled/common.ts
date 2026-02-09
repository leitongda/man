import styled from 'styled-components'

/**
 * 公共 styled-components
 * 提取项目中多处复用的布局模式
 */

/* 页面头部：标题 + 操作按钮 */
export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`

/* 页面头部（带底部间距 24px） */
export const PageHeaderLarge = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`

/* 加载状态居中 */
export const LoadingCenter = styled.div`
  text-align: center;
  padding: 60px 0;
`

/* 空状态居中 */
export const EmptyCenter = styled.div`
  text-align: center;
  padding: 40px 0;
  color: var(--color-text-3);
`

/* 全屏居中容器（用于 AuthGuard 等） */
export const FullScreenCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`

/* 半屏居中文字提示 */
export const HalfScreenCenter = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  color: var(--color-text-3);
  font-size: 16px;
`

/* flex 行：两端对齐 + 垂直居中 */
export const FlexBetween = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

/* flex 行：左对齐 + 垂直居中 + 间距 */
export const FlexRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

/* 次要文字（小字号 + 次要颜色） */
export const SecondaryText = styled.span`
  color: var(--color-text-3);
  font-size: 12px;
`

/* 节拍 / 故事线等列表项卡片 */
export const SectionBlock = styled.div`
  margin-bottom: 12px;
  padding: 12px;
  background: var(--color-fill-1);
  border-radius: 4px;
`

/* Tab 操作栏（Tab 下方的按钮区） */
export const TabActionBar = styled.div`
  margin-bottom: 12px;
`
