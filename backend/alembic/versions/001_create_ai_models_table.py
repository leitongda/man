"""create ai_models table

Revision ID: 001
Revises: 
Create Date: 2026-02-05

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 创建枚举类型
    model_provider_enum = sa.Enum(
        'openai', 'openai_compatible', 'anthropic', 
        'stable_diffusion', 'comfyui', 'midjourney',
        name='model_provider'
    )
    model_type_enum = sa.Enum(
        'text_generation', 'image_generation', 'image_analysis',
        name='model_type'
    )
    
    op.create_table(
        'ai_models',
        # 基础字段
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, comment='显示名称'),
        sa.Column('provider', model_provider_enum, nullable=False, comment='提供商类型'),
        sa.Column('model_type', model_type_enum, nullable=False, comment='模型类型'),
        sa.Column('model_name', sa.String(100), nullable=False, comment='实际模型名称'),
        
        # 连接配置
        sa.Column('api_key', sa.Text(), nullable=True, comment='API密钥(加密存储)'),
        sa.Column('base_url', sa.String(500), nullable=True, comment='API基础URL'),
        sa.Column('api_version', sa.String(50), nullable=True, comment='API版本'),
        sa.Column('organization_id', sa.String(100), nullable=True, comment='组织ID'),
        sa.Column('deployment_name', sa.String(100), nullable=True, comment='部署名称'),
        
        # 文本生成配置
        sa.Column('default_max_tokens', sa.Integer(), nullable=True, comment='默认最大token'),
        sa.Column('default_temperature', sa.Float(), nullable=True, comment='默认温度'),
        
        # 图像生成配置
        sa.Column('default_width', sa.Integer(), nullable=True, comment='默认宽度'),
        sa.Column('default_height', sa.Integer(), nullable=True, comment='默认高度'),
        sa.Column('default_steps', sa.Integer(), nullable=True, comment='默认步数'),
        sa.Column('default_cfg_scale', sa.Float(), nullable=True, comment='默认CFG'),
        sa.Column('default_sampler', sa.String(50), nullable=True, comment='默认采样器'),
        sa.Column('checkpoint_name', sa.String(200), nullable=True, comment='模型文件名'),
        sa.Column('workflow_template', sa.String(100), nullable=True, comment='工作流模板'),
        
        # 通用配置
        sa.Column('timeout', sa.Integer(), default=300, comment='请求超时(秒)'),
        sa.Column('extra_headers', sa.JSON(), nullable=True, comment='额外请求头'),
        sa.Column('extra_config', sa.JSON(), default={}, comment='其他扩展配置'),
        
        # 状态字段
        sa.Column('is_enabled', sa.Boolean(), default=True, comment='是否启用'),
        sa.Column('is_default', sa.Boolean(), default=False, comment='是否默认'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # 创建索引
    op.create_index('ix_ai_models_model_type', 'ai_models', ['model_type'])
    op.create_index('ix_ai_models_provider', 'ai_models', ['provider'])
    op.create_index('ix_ai_models_is_default', 'ai_models', ['model_type', 'is_default'])


def downgrade() -> None:
    op.drop_index('ix_ai_models_is_default', table_name='ai_models')
    op.drop_index('ix_ai_models_provider', table_name='ai_models')
    op.drop_index('ix_ai_models_model_type', table_name='ai_models')
    op.drop_table('ai_models')
    
    # 删除枚举类型
    op.execute('DROP TYPE IF EXISTS model_provider')
    op.execute('DROP TYPE IF EXISTS model_type')
