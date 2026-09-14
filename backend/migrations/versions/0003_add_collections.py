"""Add generic collection and item storage.

Revision ID: 0003_add_collections
Revises: 0002_add_user_id_to_works
"""
from alembic import op
import sqlalchemy as sa

revision = '0003_add_collections'
down_revision = '0002_add_user_id_to_works'
branch_labels = None
depends_on = None


def upgrade():
    # Local development may already have created these through create_tables().
    connection = op.get_bind()
    inspector = sa.inspect(connection)
    tables = inspector.get_table_names()
    if 'collections' not in tables:
        op.create_table(
            'collections',
            sa.Column('id', sa.String(), primary_key=True),
            sa.Column('work_id', sa.String(), sa.ForeignKey('works.id'), nullable=False),
            sa.Column('name', sa.String(255), nullable=False),
            sa.Column('template', sa.JSON(), nullable=False),
            sa.UniqueConstraint('work_id', 'name', name='uq_collection_work_name'),
        )
        op.create_index('ix_collections_work_id', 'collections', ['work_id'])
    if 'collection_items' not in tables:
        op.create_table(
            'collection_items',
            sa.Column('id', sa.String(), primary_key=True),
            sa.Column('collection_id', sa.String(), sa.ForeignKey('collections.id'), nullable=False),
            sa.Column('name', sa.String(255), nullable=False, server_default='untitled'),
            sa.Column('description', sa.String(1000), nullable=False, server_default=''),
            sa.Column('order_index', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('fields', sa.JSON(), nullable=False),
        )
        op.create_index('ix_collection_items_collection_id', 'collection_items', ['collection_id'])
        return

    # Upgrade tables created by older local development builds before this
    # migration was committed.
    columns = {column['name'] for column in inspector.get_columns('collection_items')}
    had_display_metadata = 'name' in columns or 'title' in columns
    if 'name' not in columns and 'title' in columns:
        op.alter_column('collection_items', 'title', new_column_name='name')
        columns.remove('title')
        columns.add('name')
    if 'name' not in columns:
        if not had_display_metadata:
            connection.execute(sa.text(
                "DELETE FROM collection_items WHERE collection_id IN "
                "(SELECT id FROM collections WHERE name = 'Characters')"
            ))
        op.add_column('collection_items', sa.Column(
            'name', sa.String(255), nullable=False, server_default='untitled'
        ))
    if 'description' not in columns:
        op.add_column('collection_items', sa.Column(
            'description', sa.String(1000), nullable=False, server_default=''
        ))
    if 'order_index' not in columns:
        op.add_column('collection_items', sa.Column(
            'order_index', sa.Integer(), nullable=False, server_default='0'
        ))
        rows = connection.execute(sa.text(
            'SELECT id, collection_id FROM collection_items ORDER BY collection_id, id'
        )).fetchall()
        next_indexes = {}
        for item_id, collection_id in rows:
            index = next_indexes.get(collection_id, 0)
            connection.execute(
                sa.text('UPDATE collection_items SET order_index = :index WHERE id = :id'),
                {'index': index, 'id': item_id},
            )
            next_indexes[collection_id] = index + 1


def downgrade():
    op.drop_table('collection_items')
    op.drop_table('collections')
