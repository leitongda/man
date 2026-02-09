import { useState } from 'react'
import { Form, Input, Typography, Link, Message, Space } from '@arco-design/web-react'
import { IconLock, IconUser, IconEmail } from '@arco-design/web-react/icon'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'
import {
  PageContainer, RegisterCard, Header, StyledTitle,
  SubmitButton, FooterWrap, FooterHint,
} from './styles'

const { Paragraph } = Typography
const FormItem = Form.Item

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const register = useAuthStore((s) => s.register)

  const handleSubmit = async () => {
    try {
      const values = await form.validate()
      if (values.password !== values.confirmPassword) {
        Message.error('两次密码输入不一致')
        return
      }
      setLoading(true)
      await register({
        username: values.username, email: values.email,
        password: values.password, nickname: values.nickname,
      })
      Message.success('注册成功')
      navigate('/')
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail) Message.error(detail)
      else if (!error?.errorFields) Message.error('注册失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <RegisterCard>
        <Header>
          <StyledTitle heading={3}>创建账号</StyledTitle>
          <Paragraph type="secondary">注册后即可开始创作 AI 漫画</Paragraph>
        </Header>

        <Form form={form} layout="vertical" size="large" onSubmit={handleSubmit}>
          <FormItem label="用户名" field="username" rules={[
            { required: true, message: '请输入用户名' },
            { minLength: 3, message: '用户名至少3个字符' },
            { match: /^[a-zA-Z0-9_]+$/, message: '只允许字母、数字和下划线' },
          ]}>
            <Input prefix={<IconUser />} placeholder="3-50位字母、数字或下划线" />
          </FormItem>
          <FormItem label="邮箱" field="email" rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}>
            <Input prefix={<IconEmail />} placeholder="your@email.com" />
          </FormItem>
          <FormItem label="昵称" field="nickname">
            <Input placeholder="可选，默认使用用户名" />
          </FormItem>
          <FormItem label="密码" field="password" rules={[
            { required: true, message: '请输入密码' },
            { minLength: 6, message: '密码至少6个字符' },
          ]}>
            <Input.Password prefix={<IconLock />} placeholder="至少6位密码" />
          </FormItem>
          <FormItem label="确认密码" field="confirmPassword" rules={[{ required: true, message: '请再次输入密码' }]}>
            <Input.Password prefix={<IconLock />} placeholder="再次输入密码" onPressEnter={handleSubmit} />
          </FormItem>
          <FormItem>
            <SubmitButton type="primary" long loading={loading} htmlType="submit">注册</SubmitButton>
          </FormItem>
        </Form>

        <FooterWrap>
          <Space>
            <FooterHint>已有账号？</FooterHint>
            <Link onClick={() => navigate('/login')}>返回登录</Link>
          </Space>
        </FooterWrap>
      </RegisterCard>
    </PageContainer>
  )
}
