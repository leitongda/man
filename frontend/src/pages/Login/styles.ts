import styled, { createGlobalStyle, keyframes } from 'styled-components'
import { Card, Button, Typography, Link, Form } from '@arco-design/web-react'

const { Title, Paragraph } = Typography

export const GlobalStyles = createGlobalStyle`
  @property --angle {
    syntax: "<angle>";
    initial-value: 0deg;
    inherits: false;
  }
`

const gradientRotate = keyframes`
  0%     { --angle: 0deg }
  7.14%  { --angle: 21.8deg }
  42.86% { --angle: 158.2deg }
  57.14% { --angle: 201.8deg }
  92.86% { --angle: 338.2deg }
  to     { --angle: 360deg }
`

export const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: rgb(250 250 250);
  transition: background-color 0.2s;
  body[arco-theme='dark'] & {
    background-color: rgb(26 26 26);
  }
`

export const LoginCard = styled(Card)`
  width: 420px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
  border-radius: 16px;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  z-index: 2;
  .arco-card-body { padding: 40px; }
`

export const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
`

export const StyledTitle = styled(Title)`
  && { margin: 0 0 8px 0; color: var(--color-text-1); }
`

export const StyledParagraph = styled(Paragraph)`
  && { color: var(--color-text-3); }
`

export const GradientButton = styled(Button)`
  && {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 2px;
    border: none;
    border-radius: 12px;
    color: #fff;
    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
    box-shadow: 0 4px 16px rgba(0,148,255,0.3);
    transition: box-shadow 0.3s, transform 0.2s;
    background: linear-gradient(var(--angle),#47c0ff -18.45%,#0094ff 17.73%,#836cff 39.48%,#ff56f2 74.15%,#ffb75c 93.09%);
    animation: ${gradientRotate} 5s linear infinite;
  }
  &&:hover {
    box-shadow: 0 6px 24px rgba(131,108,255,0.45);
    transform: translateY(-1px);
  }
  &&:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(0,148,255,0.3);
  }
`

export const ButtonFormItem = styled(Form.Item)`
  && { margin-top: 24px; }
`

export const FooterWrap = styled.div`
  text-align: center;
  margin-top: 16px;
`

export const FooterHint = styled.span`
  color: var(--color-text-3);
`

export const RegisterLink = styled(Link)`
  && { color: #30cfd0; }
`
