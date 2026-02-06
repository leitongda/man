"""create presets and story_outlines tables

Revision ID: 003
Revises: 002
Create Date: 2026-02-06

"""
from alembic import op
import sqlalchemy as sa


revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 预设类型枚举
    preset_type_enum = sa.Enum(
        'character', 'world', 'style', 'scene', 'storyboard',
        name='preset_type'
    )

    # 创建预设表
    op.create_table(
        'presets',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('owner_id', sa.String(36), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('type', preset_type_enum, nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('data', sa.JSON(), nullable=False, server_default='{}'),
        sa.Column('is_public', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_presets_owner_id', 'presets', ['owner_id'])
    op.create_index('ix_presets_type', 'presets', ['type'])
    op.create_index('ix_presets_is_public', 'presets', ['is_public'])

    # 创建故事大纲表
    op.create_table(
        'story_outlines',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('project_id', sa.String(36), sa.ForeignKey('projects.id'), nullable=False, unique=True),
        sa.Column('synopsis_short', sa.Text(), nullable=True),
        sa.Column('synopsis_mid', sa.Text(), nullable=True),
        sa.Column('synopsis_long', sa.Text(), nullable=True),
        sa.Column('key_beats', sa.JSON(), server_default='[]'),
        sa.Column('storylines', sa.JSON(), server_default='[]'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    op.create_index('ix_story_outlines_project_id', 'story_outlines', ['project_id'], unique=True)


def downgrade() -> None:
    op.drop_index('ix_story_outlines_project_id', table_name='story_outlines')
    op.drop_table('story_outlines')

    op.drop_index('ix_presets_is_public', table_name='presets')
    op.drop_index('ix_presets_type', table_name='presets')
    op.drop_index('ix_presets_owner_id', table_name='presets')
    op.drop_table('presets')

    op.execute('DROP TYPE IF EXISTS preset_type')
