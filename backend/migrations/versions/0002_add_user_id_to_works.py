"""add user_id to works

Revision ID: 0002_add_user_id_to_works
Revises: 0001_add_users_table
Create Date: 2026-08-14 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002_add_user_id_to_works'
down_revision = '0001_add_users_table'
branch_labels = None
depends_on = None


def upgrade():
    # Add nullable user_id column so existing rows are preserved.
    op.add_column('works', sa.Column('user_id', sa.String(length=36), nullable=True))
    op.create_index('ix_works_user_id', 'works', ['user_id'])


def downgrade():
    op.drop_index('ix_works_user_id', table_name='works')
    op.drop_column('works', 'user_id')
