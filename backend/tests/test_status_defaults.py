from uuid import uuid4
import importlib.util
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, inspect, text
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool

from app.api.status_tags import router
from app.core.dependencies import get_current_user, get_db
from app.infrastructure.database import Base
from app.infrastructure.models import StatusTagModel, WorkModel, CollectionModel, CollectionItemModel
from app.schemas.auth import AuthenticatedUser


@pytest.fixture
def context():
    engine = create_engine('sqlite://', connect_args={'check_same_thread': False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    user = AuthenticatedUser(id=str(uuid4()), supabase_user_id='status-owner')

    def database():
        with Session(engine) as db:
            yield db

    app = FastAPI()
    app.include_router(router, prefix='/api')
    app.dependency_overrides[get_db] = database
    app.dependency_overrides[get_current_user] = lambda: user
    with TestClient(app) as client:
        yield client, engine, user
    engine.dispose()


def test_default_persists_after_rename_and_does_not_change_existing_works(context):
    client, engine, user = context
    tags = client.get('/api/tags').json()
    assert [tag['name'] for tag in tags if tag['is_default']] == ['Todo']
    chosen = next(tag for tag in tags if tag['name'] == 'Done')
    with Session(engine) as db:
        work = WorkModel(user_id=user.id, title='Existing', status_tag_id=tags[0]['id'])
        db.add(work)
        db.commit()
        work_id = work.id
    assert client.put(f"/api/tags/{chosen['id']}/default").status_code == 200
    assert client.patch(f"/api/tags/{chosen['id']}", json={'name': 'Finished'}).status_code == 200
    defaults = [tag for tag in client.get('/api/tags').json() if tag['is_default']]
    assert len(defaults) == 1
    assert defaults[0]['id'] == chosen['id']
    assert defaults[0]['name'] == 'Finished'
    with Session(engine) as db:
        assert db.get(WorkModel, work_id).status_tag_id == tags[0]['id']


def test_delete_reassigns_owned_works_and_protects_default(context):
    client, engine, user = context
    tags = client.get('/api/tags').json()
    default = next(tag for tag in tags if tag['is_default'])
    removed = next(tag for tag in tags if not tag['is_default'])
    with Session(engine) as db:
        owned = WorkModel(user_id=user.id, title='Owned', status_tag_id=removed['id'])
        other = WorkModel(user_id=str(uuid4()), title='Other', status_tag_id=removed['id'])
        db.add_all([owned, other])
        db.commit()
        owned_id, other_id = owned.id, other.id
        for work_id in (owned_id, other_id):
            db.add(CollectionModel(id=work_id, work_id=work_id, name='Characters', template={'fields': []}))
            db.flush()
            db.add(CollectionItemModel(id=work_id, collection_id=work_id, fields=[], status_tag_id=removed['id']))
        db.commit()
    assert client.delete(f"/api/tags/{default['id']}").status_code == 409
    assert client.delete(f"/api/tags/{removed['id']}").status_code == 204
    with Session(engine) as db:
        assert db.get(WorkModel, owned_id).status_tag_id == default['id']
        assert db.get(WorkModel, other_id).status_tag_id == removed['id']
        assert db.get(StatusTagModel, removed['id']) is None
        assert db.get(CollectionItemModel, owned_id).status_tag_id == default['id']
        assert db.get(CollectionItemModel, other_id).status_tag_id == removed['id']


def test_other_owners_and_non_status_tags_cannot_be_default(context):
    client, engine, user = context
    tags = client.get('/api/tags').json()
    with Session(engine) as db:
        other = StatusTagModel(user_id=str(uuid4()), name='Other', type='status')
        category = StatusTagModel(user_id=user.id, name='Genre', type='genre')
        db.add_all([other, category])
        db.commit()
        ids = [other.id, category.id]
    for tag_id in ids:
        assert client.put(f'/api/tags/{tag_id}/default').status_code == 404
    assert client.delete(f'/api/tags/{ids[0]}').status_code == 404
    assert [tag['id'] for tag in client.get('/api/tags').json() if tag['is_default']] == [tags[0]['id']]


def test_legacy_tags_without_todo_get_first_default(context):
    client, engine, user = context
    with Session(engine) as db:
        db.add_all([
            StatusTagModel(user_id=user.id, name='Later', type='status', order=2),
            StatusTagModel(user_id=user.id, name='First', type='status', order=1),
        ])
        db.commit()
    tags = client.get('/api/tags').json()
    assert [tag['name'] for tag in tags if tag['is_default']] == ['First']


def test_default_can_be_deleted_after_selecting_another(context):
    client, _, _ = context
    tags = client.get('/api/tags').json()
    previous = next(tag for tag in tags if tag['is_default'])
    replacement = next(tag for tag in tags if not tag['is_default'])
    assert client.put(f"/api/tags/{replacement['id']}/default").status_code == 200
    assert client.delete(f"/api/tags/{previous['id']}").status_code == 204
    for tag in client.get('/api/tags').json():
        if not tag['is_default']:
            assert client.delete(f"/api/tags/{tag['id']}").status_code == 204
    assert client.delete(f"/api/tags/{replacement['id']}").status_code == 409


def test_new_tags_append_with_order_gaps_and_survive_reload(context):
    client, engine, user = context
    with Session(engine) as db:
        db.add_all([
            StatusTagModel(user_id=user.id, name='First', type='status', order=0),
            StatusTagModel(user_id=user.id, name='Last', type='status', order=8),
            StatusTagModel(user_id=user.id, name='Other category', type='genre', order=90),
            StatusTagModel(user_id=str(uuid4()), name='Other owner', type='status', order=99),
        ])
        db.commit()
    for name, expected in [('New', 9), ('Newest', 10)]:
        response = client.post('/api/tags', json={'name': name, 'category': 'status'})
        assert response.status_code == 201
        assert response.json()['order'] == expected
    tags = client.get('/api/tags', params={'tag_type': 'status'}).json()
    assert [tag['name'] for tag in tags] == ['First', 'Last', 'New', 'Newest']


def test_default_column_migration_and_startup_are_idempotent(monkeypatch):
    from app import startup

    engine = create_engine('sqlite://')
    with engine.begin() as connection:
        connection.execute(text('CREATE TABLE status_tags (id VARCHAR(36) PRIMARY KEY)'))
        connection.execute(text("INSERT INTO status_tags (id) VALUES ('existing')"))
    monkeypatch.setattr(startup, 'engine', engine)
    startup.ensure_status_tags_table_has_default()
    startup.ensure_status_tags_table_has_default()
    path = Path(__file__).parents[1] / 'migrations/versions/0004_add_default_status.py'
    spec = importlib.util.spec_from_file_location('default_status_migration', path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    with engine.begin() as connection:
        with Operations.context(MigrationContext.configure(connection)):
            migration.upgrade()
            migration.downgrade()
            migration.upgrade()
        assert 'is_default' in {column['name'] for column in inspect(connection).get_columns('status_tags')}
        assert connection.execute(text('SELECT is_default FROM status_tags')).scalar_one() == 0
    engine.dispose()
