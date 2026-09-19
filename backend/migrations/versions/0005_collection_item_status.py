"""Add owner-scoped statuses to collection items.

Revision ID: 0005_collection_item_status
Revises: 0004_add_default_status
"""
from uuid import uuid4

from alembic import op
import sqlalchemy as sa

revision = '0005_collection_item_status'
down_revision = '0004_add_default_status'
branch_labels = None
depends_on = None


def upgrade():
    connection = op.get_bind()
    if 'status_tag_id' not in {
        column['name'] for column in sa.inspect(connection).get_columns('collection_items')
    }:
        op.add_column('collection_items', sa.Column('status_tag_id', sa.String(36), nullable=True))

    metadata = sa.MetaData()
    items = sa.Table('collection_items', metadata, autoload_with=connection)
    collections = sa.Table('collections', metadata, autoload_with=connection)
    works = sa.Table('works', metadata, autoload_with=connection)
    tags = sa.Table('status_tags', metadata, autoload_with=connection)
    owners = connection.execute(sa.select(works.c.user_id).select_from(
        items.join(collections, items.c.collection_id == collections.c.id)
        .join(works, collections.c.work_id == works.c.id)
    ).where(items.c.status_tag_id.is_(None), works.c.user_id.is_not(None)).distinct()).scalars().all()
    for owner in owners:
        statuses = connection.execute(sa.select(tags).where(
            tags.c.user_id == owner, tags.c.type == 'status',
        ).order_by(tags.c.order, tags.c.id)).mappings().all()
        if not statuses:
            from datetime import datetime, timezone
            now = datetime.now(timezone.utc)
            for index, (name, color) in enumerate([
                ('Todo', '#EF4444'), ('In Progress', '#F59E0B'), ('Done', '#10B981'),
            ]):
                tag_id = str(uuid4())
                connection.execute(tags.insert().values(
                    id=tag_id, user_id=owner, name=name, color=color,
                    type='status', order=index, is_default=index == 0, created_at=now,
                ))
                if index == 0:
                    default_id = tag_id
        else:
            default = next((tag for tag in statuses if tag['is_default']), None)
            if default is None:
                default = next((tag for tag in statuses if tag['name'].lower() == 'todo'), statuses[0])
                connection.execute(tags.update().where(tags.c.id == default['id']).values(is_default=True))
            default_id = default['id']
        owned_collections = sa.select(collections.c.id).join(
            works, collections.c.work_id == works.c.id,
        ).where(works.c.user_id == owner)
        connection.execute(items.update().where(
            items.c.collection_id.in_(owned_collections), items.c.status_tag_id.is_(None),
        ).values(status_tag_id=default_id))


def downgrade():
    op.drop_column('collection_items', 'status_tag_id')
