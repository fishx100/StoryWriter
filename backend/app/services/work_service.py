from uuid import UUID

from app.domain.entities import Work
from app.domain.repositories import WorkRepository


class WorkService:
    def __init__(self, repository: WorkRepository) -> None:
        self._repository = repository

    def create_work(self, title: str, premise: str = '', genre: str = '', status_tag_id: str = 'todo') -> Work:
        work = Work(title=title, premise=premise, genre=genre, status_tag_id=status_tag_id)
        return self._repository.create(work)

    def list_works(self) -> list[Work]:
        return self._repository.list_all()

    def get_work(self, work_id: UUID) -> Work | None:
        return self._repository.get_by_id(work_id)
    def update_work_status(self, work_id: UUID, status_tag_id: str) -> Work | None:
        return self._repository.update_status(work_id, status_tag_id)
    def delete_work(self, work_id: UUID) -> bool:
        return self._repository.delete(work_id)

    def update_work(
        self,
        work_id: UUID,
        title: str | None = None,
        premise: str | None = None,
        genre: str | None = None,
        status_tag_id: str | None = None,
    ) -> Work | None:
        return self._repository.update(work_id, title=title, premise=premise, genre=genre, status_tag_id=status_tag_id)
