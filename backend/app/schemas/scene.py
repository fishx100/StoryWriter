from pydantic import BaseModel
from typing import List
from typing import Optional


class SceneCreate(BaseModel):
    title: str
    summary: str = ''
    content: str = ''
    status: str = 'todo'


class SceneRead(SceneCreate):
    id: str
    order_index: int
    word_count: int


class SceneUpdate(BaseModel):
    title: Optional[str] = None
    summary: Optional[str] = None
    content: Optional[str] = None
    status: Optional[str] = None


class SceneReorder(BaseModel):
    order: List[str]
