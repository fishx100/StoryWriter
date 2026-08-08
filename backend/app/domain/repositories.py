from typing import Protocol
from uuid import UUID

from app.domain.entities import Work


class WorkRepository(Protocol):
    def get_by_id(self, work_id: UUID) -> Work | None:
        raise NotImplementedError

    def list_all(self) -> list[Work]:
        raise NotImplementedError

    def create(self, work: Work) -> Work:
        raise NotImplementedError

    def delete(self, work_id: UUID) -> bool:
        raise NotImplementedError

    def update_status(self, work_id: UUID, status: str) -> Work | None:
        raise NotImplementedError

    def update(
        self,
        work_id: UUID,
        title: str | None = None,
        premise: str | None = None,
        genre: str | None = None,
        status_tag_id: str | None = None,
    ) -> Work | None:
        raise NotImplementedError
