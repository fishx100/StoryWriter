from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

engine = create_engine(
	settings.database_url,
	future=True,
	connect_args={"check_same_thread": False} if settings.database_url.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def create_tables() -> None:
	from app.infrastructure import models  # noqa: F401

	Base.metadata.create_all(bind=engine)
