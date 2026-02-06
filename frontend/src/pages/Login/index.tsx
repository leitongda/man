import { useState } from 'react'
import {
  Card,
  Form,
  Input,
  Button,
  Typography,
  Link,
  Message,
  Space,
} from '@arco-design/web-react'
import { IconLock, IconUser } from '@arco-design/web-react/icon'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth'

const { Title, Paragraph } = Typography
const FormItem = Form.Item

export default function LoginPage() {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const login = useAuthStore((s) => s.login)

  const handleSubmit = async () => {
    try {
      const values = await form.validate()
      setLoading(true)
      await login(values)
      Message.success('登录成功')
      navigate('/')
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail) {
        Message.error(detail)
      } else if (error?.errorFields) {
        // form validation error, do nothing
      } else {
        Message.error('登录失败，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 420,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          borderRadius: 12,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title heading={3} style={{ margin: '0 0 8px 0' }}>
            MAN
          </Title>
          <Paragraph type="secondary">
            AI 漫画生成系统
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          size="large"
          onSubmit={handleSubmit}
        >
          <FormItem
            label="用户名"
            field="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<IconUser />}
              placeholder="用户名或邮箱"
              onPressEnter={handleSubmit}
            />
          </FormItem>

          <FormItem
            label="密码"
            field="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<IconLock />}
              placeholder="请输入密码"
              onPressEnter={handleSubmit}
            />
          </FormItem>

          <FormItem>
            <Button
              type="primary"
              long
              loading={loading}
              htmlType="submit"
              style={{ height: 40 }}
            >
              登录
            </Button>
          </FormItem>
        </Form>

        <div style={{ textAlign: 'center' }}>
          <Space>
            <span style={{ color: 'var(--color-text-3)' }}>还没有账号？</span>
            <Link onClick={() => navigate('/register')}>立即注册</Link>
          </Space>
        </div>
      </Card>
    </div>
  )
}
