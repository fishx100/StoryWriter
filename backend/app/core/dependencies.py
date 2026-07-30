from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from app.infrastructure.database import SessionLocal
from app.infrastructure.repositories.work_repository import SqlAlchemyWorkRepository
from app.services.work_service import WorkService


def get_db() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_work_service(db: Session = Depends(get_db)) -> WorkService:
    return WorkService(SqlAlchemyWorkRepository(db))
