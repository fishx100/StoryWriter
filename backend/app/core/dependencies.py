from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from app.infrastructure.database import SessionLocal
from app.infrastructure.repositories.work_repository import SqlAlchemyWorkRepository
from app.services.work_service import WorkService
from app.infrastructure.repositories.status_tag_repository import SqlAlchemyStatusTagRepository
from app.services.status_tag_service import StatusTagService


def get_db() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_work_service(db: Session = Depends(get_db)) -> WorkService:
    return WorkService(SqlAlchemyWorkRepository(db))


def get_status_tag_service(db: Session = Depends(get_db)) -> StatusTagService:
    return StatusTagService(SqlAlchemyStatusTagRepository(db))
