"""Persist the user's default status tag.

Revision ID: 0004_add_default_status
Revises: 0003_add_collections
"""
from alembic import op
import sqlalchemy as sa

revision = '0004_add_default_status'
down_revision = '0003_add_collections'
branch_labels = None
depends_on = None


def upgrade():
    # Local startup may already have added this column.
    if 'is_default' not in {column['name'] for column in sa.inspect(op.get_bind()).get_columns('status_tags')}:
        op.add_column('status_tags', sa.Column('is_default', sa.Boolean(), nullable=False, server_default=sa.false()))
    # Existing users get Todo (or their first remaining status) on their next tag load.


def downgrade():
    op.drop_column('status_tags', 'is_default')
