from dataclasses import dataclass, field
from uuid import UUID, uuid4


@dataclass(slots=True)
class Work:
    id: UUID = field(default_factory=uuid4)
    title: str = ''
    premise: str = ''
    genre: str = ''
    status: str = 'drafting'
