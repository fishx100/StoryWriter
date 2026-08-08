from pydantic import BaseModel
from typing import Optional


class WorkBase(BaseModel):
    title: str
    premise: str = ''
    genre: str = ''
    status_tag_id: str | None = None


class WorkCreate(WorkBase):
    pass


class WorkRead(WorkBase):
    id: str


class WorkUpdate(BaseModel):
    title: Optional[str] = None
    premise: Optional[str] = None
    genre: Optional[str] = None
    status_tag_id: Optional[str] = None
