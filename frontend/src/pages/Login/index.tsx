import { useState, Suspense, lazy } from 'react'
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

const OctopusScene = lazy(() => import('./OctopusScene'))

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
      className="login-page-container"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 3D 章鱼场景 */}
      <Suspense fallback={null}>
        <OctopusScene />
      </Suspense>

      <Card
        style={{
          width: 420,
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
          borderRadius: 16,
          background: '#0000',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          // border: '1px solid var(--color-border)',
          border: 'none',
          zIndex: 2,
        }}
        bodyStyle={{
          padding: '40px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Title heading={3} style={{ margin: '0 0 8px 0', color: 'var(--color-text-1)' }}>
            MAN
          </Title>
          <Paragraph style={{ color: 'var(--color-text-3)' }}>
            xxxxx 生成系统
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

          <FormItem style={{ marginTop: 24 }}>
            <Button
              className="sendBtn"
              type="primary"
              long
              loading={loading}
              htmlType="submit"
              style={{
                height: 48,
                padding: '2px',
                border: 'none',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 4px 16px rgba(0, 148, 255, 0.3)',
                transition: 'box-shadow 0.3s, transform 0.2s',
              }}
            >
              <span className="sendBtn-inner">登录</span>
            </Button>
          </FormItem>
        </Form>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Space>
            <span style={{ color: 'var(--color-text-3)' }}>还没有账号？</span>
            <Link
              onClick={() => navigate('/register')}
              style={{ color: '#30cfd0' }}
            >
              立即注册
            </Link>
          </Space>
        </div>
      </Card>

      <style>{`
        @property --angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        @keyframes sendBtnGradientRotate {
          0%     { --angle: 0deg }
          7.14%  { --angle: 21.8deg }
          42.86% { --angle: 158.2deg }
          57.14% { --angle: 201.8deg }
          92.86% { --angle: 338.2deg }
          to     { --angle: 360deg }
        }

        .sendBtn {
          background: linear-gradient(var(--angle), #47c0ff -18.45%, #0094ff 17.73%, #836cff 39.48%, #ff56f2 74.15%, #ffb75c 93.09%) !important;
          -webkit-animation: sendBtnGradientRotate 5s linear infinite;
          animation: sendBtnGradientRotate 5s linear infinite;
        }

        .sendBtn-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: #fff;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 2px;
          color: #333;
          transition: background 0.35s ease, color 0.35s ease;
        }

        .sendBtn:hover {
          box-shadow: 0 6px 24px rgba(131, 108, 255, 0.45) !important;
          transform: translateY(-1px);
        }

        .sendBtn:hover .sendBtn-inner {
          background: rgba(255, 255, 255, 0.75);
          color: #fff;
        }

        .sendBtn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0, 148, 255, 0.3) !important;
        }

        .login-page-container {
          background-color: rgb(250 250 250);
          transition: background-color 0.2s;
        }
        body[arco-theme='dark'] .login-page-container {
          background-color: rgb(26 26 26);
        }

        /* 浏览器默认自动填充背景色改为透明 */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
          box-shadow: 0 0 0 1000px transparent inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-text-fill-color: var(--color-text-1) !important;
        }
      `}</style>
    </div>
  )
}
