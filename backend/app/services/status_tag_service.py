from uuid import UUID

from app.infrastructure.repositories.status_tag_repository import SqlAlchemyStatusTagRepository


class StatusTagService:
    def __init__(self, repository: SqlAlchemyStatusTagRepository) -> None:
        self._repository = repository

    def list_tags(self) -> list:
        return self._repository.list_all()

    def list_tags_by_type(self, tag_type: str) -> list:
        return self._repository.list_by_type(tag_type)

    def get_tag(self, tag_id: str):
        return self._repository.get_by_id(tag_id)

    def get_by_name(self, name: str, tag_type: str | None = None):
        return self._repository.get_by_name(name, tag_type=tag_type)

    def create_tag(self, name: str, color: str, order: int = 0, tag_type: str = 'status'):
        return self._repository.create(name=name, color=color, order=order, tag_type=tag_type)

    def update_tag(self, tag_id: str, name: str | None = None, color: str | None = None):
        return self._repository.update(tag_id, name=name, color=color)

    def delete_tag(self, tag_id: str):
        return self._repository.delete(tag_id)
