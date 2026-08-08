from typing import Iterable

from sqlalchemy import text

from app.infrastructure.database import engine, SessionLocal
from app.infrastructure.repositories.status_tag_repository import SqlAlchemyStatusTagRepository
from app.infrastructure.repositories.work_repository import SqlAlchemyWorkRepository


def _ensure_column(conn, table: str, column: str, column_def: str) -> None:
    try:
        res = conn.execute(text(f"PRAGMA table_info('{table}')"))
        cols = [row[1] for row in res.fetchall()]
        if column not in cols:
            conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column_def}"))
    except Exception:
        # best-effort only for local/dev; let create_tables handle initial creation
        return


def ensure_status_tags_table_has_type():
    with engine.begin() as conn:
        _ensure_column(conn, "status_tags", "type", "type VARCHAR(50) DEFAULT 'status'")


def ensure_works_has_status_tag_id():
    with engine.begin() as conn:
        _ensure_column(conn, "works", "status_tag_id", "status_tag_id VARCHAR(36)")


def ensure_default_status_tags(session) -> Iterable:
    repo = SqlAlchemyStatusTagRepository(session)
    existing = repo.list_by_type("status")
    if existing:
        return existing

    defaults = [
        ("Todo", "#EF4444"),
        ("In Progress", "#F59E0B"),
        ("Done", "#10B981"),
    ]
    for idx, (name, color) in enumerate(defaults):
        repo.create(name=name, color=color, order=idx, tag_type="status")
    return repo.list_by_type("status")


def migrate_works_to_todo(session):
    status_repo = SqlAlchemyStatusTagRepository(session)
    work_repo = SqlAlchemyWorkRepository(session)

    todo = status_repo.get_by_name("Todo", tag_type="status")
    if todo is None:
        return

    for w in work_repo.list_all():
        if getattr(w, "status_tag_id", None) in (None, ""):
            work_repo.update_status(w.id, todo.id)


def run_startup_tasks() -> None:
    # DDL: add new columns if needed (best-effort)
    ensure_status_tags_table_has_type()
    ensure_works_has_status_tag_id()

    # Data seeding/migrations
    session = SessionLocal()
    try:
        ensure_default_status_tags(session)
        migrate_works_to_todo(session)
    finally:
        session.close()
