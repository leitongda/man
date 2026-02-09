import styled from 'styled-components'
import { Layout, Spin } from '@arco-design/web-react'

const { Content } = Layout

export const RootLayout = styled(Layout)`
  width: 100%;
  height: 100vh;
`

export const NavbarWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: 60px;
  background-color: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
`

export const StyledSider = styled(Layout.Sider)`
  && {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 99;
    height: 100%;
    overflow: hidden;
    background-color: var(--color-bg-2);
    border-right: 1px solid var(--color-border);
    transition: width 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
  }
`

export const ContentLayout = styled(Layout)<{ $paddingLeft?: number; $paddingTop?: number }>`
  min-height: 100vh;
  overflow: hidden;
  transition: padding 0.2s cubic-bezier(0.34, 0.69, 0.1, 1);
  padding-left: ${(p) => (p.$paddingLeft != null ? `${p.$paddingLeft}px` : '0')};
  padding-top: ${(p) => (p.$paddingTop != null ? `${p.$paddingTop}px` : '0')};
`

export const ContentWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 60px);
  padding: 16px 20px 0;
`

export const BreadcrumbWrapper = styled.div`
  margin-bottom: 16px;
`

export const StyledContent = styled(Content)`
  && {
    flex: 1;
    background-color: var(--color-fill-1);
    border-radius: 4px;
    padding: 20px;
    overflow: auto;
  }
`

export const StyledSpin = styled(Spin)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 48px;
  color: var(--color-text-3);
  font-size: 12px;
`
