"""create users table and add owner_id to projects

Revision ID: 002
Revises: 001
Create Date: 2026-02-06

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 创建用户角色枚举
    user_role_enum = sa.Enum('admin', 'user', name='user_role')
    
    # 创建用户表
    op.create_table(
        'users',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('username', sa.String(50), nullable=False, unique=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('nickname', sa.String(100), nullable=True),
        sa.Column('avatar', sa.String(500), nullable=True),
        sa.Column('role', user_role_enum, nullable=False, server_default='user'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('last_login_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # 创建索引
    op.create_index('ix_users_username', 'users', ['username'], unique=True)
    op.create_index('ix_users_email', 'users', ['email'], unique=True)
    
    # 为 projects 表添加 owner_id 字段
    op.add_column('projects', sa.Column('owner_id', sa.String(36), sa.ForeignKey('users.id'), nullable=True))
    op.create_index('ix_projects_owner_id', 'projects', ['owner_id'])


def downgrade() -> None:
    op.drop_index('ix_projects_owner_id', table_name='projects')
    op.drop_column('projects', 'owner_id')
    
    op.drop_index('ix_users_email', table_name='users')
    op.drop_index('ix_users_username', table_name='users')
    op.drop_table('users')
    
    op.execute('DROP TYPE IF EXISTS user_role')
