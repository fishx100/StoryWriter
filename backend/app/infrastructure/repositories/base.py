from uuid import UUID

from app.domain.entities import Work
from app.domain.repositories import WorkRepository


class InMemoryWorkRepository(WorkRepository):
    def __init__(self) -> None:
        self._works: dict[UUID, Work] = {}

    def get_by_id(self, work_id: UUID) -> Work | None:
        return self._works.get(work_id)

    def list_all(self) -> list[Work]:
        return list(self._works.values())

    def create(self, work: Work) -> Work:
        self._works[work.id] = work
        return work
