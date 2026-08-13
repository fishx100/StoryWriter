from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass(slots=True)
class Work:
    id: UUID = field(default_factory=uuid4)
    title: str = ''
    premise: str = ''
    genre: str = ''
    # reference to StatusTag id
    status_tag_id: str | None = None



@dataclass(slots=True)
class User:
    id: UUID = field(default_factory=uuid4)
    supabase_user_id: str = ''
    email: str | None = None
