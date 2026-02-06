/**
 * 用户管理页面 - 管理员功能
 */
import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  Table,
  Button,
  Input,
  Space,
  Tag,
  Modal,
  Message,
  Popconfirm,
  Select,
  Form,
  Typography,
  Badge,
} from '@arco-design/web-react'
import {
  IconSearch,
  IconRefresh,
  IconEdit,
  IconDelete,
  IconLock,
} from '@arco-design/web-react/icon'
import { userApi } from '@/services/auth'
import type { User, UserUpdateByAdmin } from '@/types/user'

const { Title } = Typography
const FormItem = Form.Item

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | undefined>()

  // 编辑弹窗
  const [editVisible, setEditVisible] = useState(false)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [editForm] = Form.useForm()
  const [editLoading, setEditLoading] = useState(false)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await userApi.list({
        page,
        page_size: pageSize,
        keyword: keyword || undefined,
        role: roleFilter || undefined,
      })
      setUsers(res.items)
      setTotal(res.total)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, keyword, roleFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleEdit = (user: User) => {
    setEditUser(user)
    editForm.setFieldsValue({
      nickname: user.nickname,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
    })
    setEditVisible(true)
  }

  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validate()
      setEditLoading(true)
      const data: UserUpdateByAdmin = {}
      if (values.nickname !== editUser?.nickname) data.nickname = values.nickname
      if (values.email !== editUser?.email) data.email = values.email
      if (values.role !== editUser?.role) data.role = values.role
      if (values.is_active !== editUser?.is_active) data.is_active = values.is_active

      await userApi.update(editUser!.id, data)
      Message.success('更新成功')
      setEditVisible(false)
      fetchUsers()
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail) Message.error(detail)
    } finally {
      setEditLoading(false)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      await userApi.delete(userId)
      Message.success('用户已删除')
      fetchUsers()
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail) Message.error(detail)
    }
  }

  const handleResetPassword = async (userId: string) => {
    try {
      const res = await userApi.resetPassword(userId)
      Message.success(res.message)
    } catch (error: any) {
      const detail = error?.response?.data?.detail
      if (detail) Message.error(detail)
    }
  }

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      width: 140,
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      width: 140,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      width: 200,
    },
    {
      title: '角色',
      dataIndex: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'arcoblue' : 'gray'}>
          {role === 'admin' ? '管理员' : '普通用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      width: 80,
      render: (active: boolean) => (
        <Badge status={active ? 'success' : 'default'} text={active ? '正常' : '禁用'} />
      ),
    },
    {
      title: '最后登录',
      dataIndex: 'last_login_at',
      width: 170,
      render: (val: string) => val ? new Date(val).toLocaleString('zh-CN') : '-',
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      width: 170,
      render: (val: string) => new Date(val).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<IconEdit />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定重置密码为 123456？"
            onOk={() => handleResetPassword(record.id)}
          >
            <Button type="text" size="small" icon={<IconLock />}>
              重置密码
            </Button>
          </Popconfirm>
          <Popconfirm
            title="确定删除该用户？此操作不可恢复。"
            onOk={() => handleDelete(record.id)}
          >
            <Button type="text" size="small" status="danger" icon={<IconDelete />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title heading={5}>用户管理</Title>
      </div>

      <Card>
        {/* 搜索和过滤 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <Space>
            <Input.Search
              placeholder="搜索用户名、邮箱或昵称"
              style={{ width: 280 }}
              value={keyword}
              onChange={setKeyword}
              onSearch={() => { setPage(1); fetchUsers() }}
              allowClear
            />
            <Select
              placeholder="角色筛选"
              style={{ width: 140 }}
              value={roleFilter}
              onChange={(val) => { setRoleFilter(val); setPage(1) }}
              allowClear
            >
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </Space>
          <Button icon={<IconRefresh />} onClick={fetchUsers}>
            刷新
          </Button>
        </div>

        {/* 用户列表 */}
        <Table
          columns={columns}
          data={users}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            total,
            showTotal: true,
            sizeCanChange: true,
            onChange: (p, ps) => { setPage(p); setPageSize(ps) },
          }}
        />
      </Card>

      {/* 编辑弹窗 */}
      <Modal
        title={`编辑用户 - ${editUser?.username}`}
        visible={editVisible}
        onOk={handleEditSubmit}
        onCancel={() => setEditVisible(false)}
        confirmLoading={editLoading}
        style={{ width: 480 }}
      >
        <Form form={editForm} layout="vertical">
          <FormItem label="昵称" field="nickname">
            <Input placeholder="输入昵称" />
          </FormItem>
          <FormItem
            label="邮箱"
            field="email"
            rules={[{ type: 'email', message: '请输入有效邮箱' }]}
          >
            <Input placeholder="输入邮箱" />
          </FormItem>
          <FormItem label="角色" field="role">
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="user">普通用户</Select.Option>
            </Select>
          </FormItem>
          <FormItem label="状态" field="is_active">
            <Select>
              <Select.Option value={true}>正常</Select.Option>
              <Select.Option value={false}>禁用</Select.Option>
            </Select>
          </FormItem>
        </Form>
      </Modal>
    </div>
  )
}
