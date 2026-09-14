from copy import deepcopy
import importlib.util
from pathlib import Path
from uuid import uuid4

import pytest
import sqlalchemy as sa
from alembic.migration import MigrationContext
from alembic.operations import Operations
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, event, inspect, select
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api.collections import router
from app.api.works import router as works_router
from app.core.dependencies import get_current_user, get_db
from app.infrastructure.database import Base
from app.infrastructure.models import CollectionItemModel, CollectionModel, WorkModel
from app.schemas.auth import AuthenticatedUser


@pytest.fixture
def context():
    engine = create_engine(
        'sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool
    )

    @event.listens_for(engine, 'connect')
    def enable_foreign_keys(connection, _):
        connection.execute('PRAGMA foreign_keys=ON')

    Base.metadata.create_all(engine)
    user = AuthenticatedUser(id=str(uuid4()), supabase_user_id='test-owner')
    work_id, other_id = str(uuid4()), str(uuid4())
    with Session(engine) as db:
        db.add_all([
            WorkModel(id=work_id, user_id=user.id, title='Owned'),
            WorkModel(id=other_id, user_id=str(uuid4()), title='Other user'),
        ])
        db.commit()

    def database():
        with Session(engine) as db:
            yield db

    app = FastAPI()
    app.include_router(router, prefix='/api')
    app.include_router(works_router, prefix='/api')
    app.dependency_overrides[get_db] = database
    app.dependency_overrides[get_current_user] = lambda: user
    with TestClient(app) as client:
        yield client, engine, work_id, other_id, app
    engine.dispose()


def collection_payload(name='Notes'):
    return {
        'name': name,
        'template': {'fields': [
            {'id': 'name', 'label': 'Name', 'type': 'text'},
            {'id': 'body', 'label': 'Body', 'type': 'textarea'},
        ]},
    }


def create_collection(client, work_id, name='Notes'):
    response = client.post(
        f'/api/works/{work_id}/collections', json=collection_payload(name)
    )
    assert response.status_code == 201
    return response.json()


def draft(collection, name='untitled'):
    return {
        'id': str(uuid4()),
        'name': name,
        'description': '',
        'order_index': 0,
        'fields': [
            {
                **field,
                'value': {'number': None, 'checkbox': False}.get(field['type'], ''),
            }
            for field in collection['template']['fields']
        ],
    }


def create_body(item):
    return {key: item[key] for key in ('id', 'name', 'description', 'fields')}


def update_body(item):
    return {key: item[key] for key in ('name', 'description', 'fields')}


def test_create_inserts_first_and_duplicate_collection_keeps_template(context):
    client, _, work_id, _, _ = context
    collection = create_collection(client, work_id)
    replacement = collection_payload()
    replacement['template']['fields'] = []
    repeated = client.post(f'/api/works/{work_id}/collections', json=replacement)
    assert repeated.status_code == 200
    assert repeated.json()['id'] == collection['id']
    assert repeated.json()['template'] == collection['template']

    base_url = f"/api/collections/{collection['id']}"
    created = [
        client.post(base_url + '/items', json=create_body(draft(collection, name))).json()
        for name in ('First', 'Second', 'Third')
    ]
    loaded = client.get(base_url).json()['items']
    assert [item['name'] for item in loaded] == ['Third', 'Second', 'First']
    assert [item['order_index'] for item in loaded] == [0, 1, 2]
    assert created[-1]['order_index'] == 0


def test_update_uses_item_snapshot_and_updates_metadata(context):
    client, engine, work_id, _, _ = context
    collection = create_collection(client, work_id)
    base_url = f"/api/collections/{collection['id']}"
    item = client.post(base_url + '/items', json=create_body(draft(collection))).json()
    with Session(engine) as db:
        stored = db.get(CollectionModel, collection['id'])
        changed = deepcopy(stored.template)
        changed['fields'][0]['label'] = 'New label'
        changed['fields'].append({'id': 'age', 'label': 'Age', 'type': 'number'})
        stored.template = changed
        db.commit()

    item['name'] = 'Ada'
    item['description'] = 'An explorer'
    item['fields'][0]['value'] = 'Ada'
    item['fields'][1]['value'] = 'An explorer'
    saved = client.patch(base_url + '/items/' + item['id'], json=update_body(item))
    assert saved.status_code == 200
    assert saved.json() == item
    assert client.get(base_url).json()['items'] == [item]


def test_reorder_persists_and_validates_complete_membership(context):
    client, _, work_id, _, _ = context
    collection = create_collection(client, work_id)
    base_url = f"/api/collections/{collection['id']}"
    items = [
        client.post(base_url + '/items', json=create_body(draft(collection, name))).json()
        for name in ('One', 'Two', 'Three')
    ]
    order = [items[0]['id'], items[2]['id'], items[1]['id']]
    assert client.post(base_url + '/items/reorder', json={'order': order}).status_code == 204
    loaded = client.get(base_url).json()['items']
    assert [item['id'] for item in loaded] == order
    assert [item['order_index'] for item in loaded] == [0, 1, 2]
    for invalid in (order[:-1], order + [order[0]], order[:-1] + [str(uuid4())]):
        assert client.post(base_url + '/items/reorder', json={'order': invalid}).status_code == 400


def test_delete_compacts_order_and_checks_membership(context):
    client, _, work_id, _, _ = context
    collection = create_collection(client, work_id)
    base_url = f"/api/collections/{collection['id']}"
    items = [
        client.post(base_url + '/items', json=create_body(draft(collection, name))).json()
        for name in ('One', 'Two', 'Three')
    ]
    assert client.delete(base_url + '/items/' + items[1]['id']).status_code == 204
    loaded = client.get(base_url).json()['items']
    assert [item['name'] for item in loaded] == ['Three', 'One']
    assert [item['order_index'] for item in loaded] == [0, 1]

    second = create_collection(client, work_id, 'Other')
    foreign = client.post(
        f"/api/collections/{second['id']}/items", json=create_body(draft(second))
    ).json()
    assert client.delete(base_url + '/items/' + foreign['id']).status_code == 404


def test_validation_duplicate_ids_and_checkbox(context):
    client, _, work_id, _, _ = context
    collection = create_collection(client, work_id)
    url = f"/api/collections/{collection['id']}/items"
    item = draft(collection)
    assert client.post(url, json=create_body(item)).status_code == 201
    assert client.post(url, json=create_body(item)).status_code == 409
    for fields in ([], item['fields'][::-1], [item['fields'][0]] * 2):
        assert client.patch(
            url + '/' + item['id'], json={**update_body(item), 'fields': fields}
        ).status_code == 422

    tasks = {
        'name': 'Tasks',
        'template': {'fields': [{'id': 'done', 'label': 'Done', 'type': 'checkbox'}]},
    }
    task_collection = client.post(f'/api/works/{work_id}/collections', json=tasks).json()
    task = client.post(
        f"/api/collections/{task_collection['id']}/items",
        json=create_body(draft(task_collection)),
    ).json()
    task['fields'][0]['value'] = True
    task_url = f"/api/collections/{task_collection['id']}/items/{task['id']}"
    assert client.patch(task_url, json=update_body(task)).json() == task
    task['fields'][0]['value'] = 'true'
    assert client.patch(task_url, json=update_body(task)).status_code == 422


def test_ownership_protects_item_operations(context):
    client, _, work_id, other_id, app = context
    collection = create_collection(client, work_id)
    base_url = f"/api/collections/{collection['id']}"
    item = client.post(base_url + '/items', json=create_body(draft(collection))).json()
    assert client.get(f'/api/works/{other_id}/collections').status_code == 404
    app.dependency_overrides[get_current_user] = lambda: AuthenticatedUser(
        id='intruder', supabase_user_id='intruder'
    )
    assert client.get(base_url).status_code == 404
    assert client.patch(base_url + '/items/' + item['id'], json=update_body(item)).status_code == 404
    assert client.post(base_url + '/items/reorder', json={'order': [item['id']]}).status_code == 404
    assert client.delete(base_url + '/items/' + item['id']).status_code == 404


def test_work_deletion_cleans_up_collection_storage(context):
    client, engine, work_id, _, _ = context
    collection = create_collection(client, work_id)
    client.post(
        f"/api/collections/{collection['id']}/items",
        json=create_body(draft(collection)),
    )
    assert client.delete(f'/api/works/{work_id}').status_code == 204
    with Session(engine) as db:
        assert db.get(WorkModel, work_id) is None
        assert db.scalars(select(CollectionModel)).all() == []
        assert db.scalars(select(CollectionItemModel)).all() == []


def _load_migration(name):
    path = Path(__file__).resolve().parents[1] / f'migrations/versions/{name}.py'
    spec = importlib.util.spec_from_file_location(name, path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    return migration


def test_collection_migration_creates_final_schema_and_downgrades():
    migration = _load_migration('0003_add_collections')
    engine = create_engine('sqlite://')
    metadata = sa.MetaData()
    sa.Table(
        'works', metadata,
        sa.Column('id', sa.String(), primary_key=True),
    )
    metadata.create_all(engine)
    with engine.begin() as connection:
        with Operations.context(MigrationContext.configure(connection)):
            migration.upgrade()
        assert {'id', 'work_id', 'name', 'template'} <= {
            column['name'] for column in inspect(connection).get_columns('collections')
        }
        assert {'id', 'collection_id', 'name', 'description', 'order_index', 'fields'} <= {
            column['name'] for column in inspect(connection).get_columns('collection_items')
        }
        with Operations.context(MigrationContext.configure(connection)):
            migration.downgrade()
        assert 'collections' not in inspect(connection).get_table_names()
        assert 'collection_items' not in inspect(connection).get_table_names()
    engine.dispose()


def test_collection_migration_upgrades_existing_title_metadata():
    migration = _load_migration('0003_add_collections')
    engine = create_engine('sqlite://')
    metadata = sa.MetaData()
    collections = sa.Table(
        'collections', metadata,
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('name', sa.String(), nullable=False),
    )
    items = sa.Table(
        'collection_items', metadata,
        sa.Column('id', sa.String(), primary_key=True),
        sa.Column('collection_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False, server_default='untitled'),
        sa.Column('description', sa.String(1000), nullable=False, server_default=''),
        sa.Column('fields', sa.JSON(), nullable=False),
    )
    metadata.create_all(engine)
    with engine.begin() as connection:
        connection.execute(collections.insert(), {'id': 'characters', 'name': 'Characters'})
        connection.execute(items.insert(), [
            {
                'id': 'item-b', 'collection_id': 'characters', 'title': 'Bob',
                'description': '', 'fields': [],
            },
            {
                'id': 'item-a', 'collection_id': 'characters', 'title': 'Ada',
                'description': 'Explorer', 'fields': [],
            },
        ])
        with Operations.context(MigrationContext.configure(connection)):
            migration.upgrade()
        assert 'title' not in {
            column['name'] for column in inspect(connection).get_columns('collection_items')
        }
        assert connection.execute(sa.text(
            'SELECT id, name, description, order_index FROM collection_items '
            'ORDER BY order_index'
        )).fetchall() == [
            ('item-a', 'Ada', 'Explorer', 0),
            ('item-b', 'Bob', '', 1),
        ]
    engine.dispose()
