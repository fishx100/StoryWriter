from pydantic import BaseModel
from typing import List, Optional


class CharacterCreate(BaseModel):
    name: str
    description: str = ''


class CharacterRead(CharacterCreate):
    id: str
    order_index: int


class CharacterUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class CharacterReorder(BaseModel):
    order: List[str]
