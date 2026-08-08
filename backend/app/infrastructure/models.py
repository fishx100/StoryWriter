from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import DateTime, String, Integer
from sqlalchemy.orm import Mapped, mapped_column

from app.infrastructure.database import Base


class StatusTagModel(Base):
    __tablename__ = 'status_tags'

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=False, default='#888888')
    type: Mapped[str] = mapped_column(String(50), nullable=False, default='status')
    order: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )


class WorkModel(Base):
    __tablename__ = 'works'

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    premise: Mapped[str] = mapped_column(String(1000), nullable=False, default='')
    genre: Mapped[str] = mapped_column(String(100), nullable=False, default='')
    status_tag_id: Mapped[str] = mapped_column(String(36), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class SceneModel(Base):
    __tablename__ = 'scenes'

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    work_id: Mapped[str] = mapped_column(String, nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default='Untitled scene')
    summary: Mapped[str] = mapped_column(String(1000), nullable=False, default='')
    content: Mapped[str] = mapped_column(String, nullable=False, default='')
    status: Mapped[str] = mapped_column(String(50), nullable=False, default='todo')
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    word_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )

class CharacterModel(Base):
    __tablename__ = 'characters'

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid4()))
    work_id: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False, default='Unnamed character')
    description: Mapped[str] = mapped_column(String(1000), nullable=False, default='')
    order_index: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc)
    )