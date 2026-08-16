from uuid import UUID

from app.infrastructure.repositories.status_tag_repository import SqlAlchemyStatusTagRepository


class StatusTagService:
    def __init__(self, repository: SqlAlchemyStatusTagRepository) -> None:
        self._repository = repository

    def list_tags(self, user_id: str | None = None) -> list:
        # Ensure per-user defaults exist for 'status' tags when a user requests any tags.
        if user_id is not None:
            owner_status = self._repository.list_by_owner(user_id, 'status')
            if not owner_status:
                defaults = [
                    ("Todo", "#EF4444"),
                    ("In Progress", "#F59E0B"),
                    ("Done", "#10B981"),
                ]
                for idx, (name, color) in enumerate(defaults):
                    self._repository.create(name=name, color=color, order=idx, tag_type='status', user_id=user_id)

        return self._repository.list_all(user_id=user_id)

    def list_tags_by_type(self, tag_type: str, user_id: str | None = None) -> list:
        # ensure user has default status tags when requesting status-type tags
        if tag_type == 'status' and user_id is not None:
            owner_tags = self._repository.list_by_owner(user_id, 'status')
            if not owner_tags:
                # create per-user defaults
                defaults = [
                    ("Todo", "#EF4444"),
                    ("In Progress", "#F59E0B"),
                    ("Done", "#10B981"),
                ]
                for idx, (name, color) in enumerate(defaults):
                    # avoid duplicate if a global exists with same name
                    self._repository.create(name=name, color=color, order=idx, tag_type='status', user_id=user_id)

        return self._repository.list_by_type(tag_type, user_id=user_id)

    def get_tag(self, tag_id: str):
        return self._repository.get_by_id(tag_id)

    def get_by_name(self, name: str, tag_type: str | None = None, user_id: str | None = None):
        return self._repository.get_by_name(name, tag_type=tag_type, user_id=user_id)

    def create_tag(self, name: str, color: str, order: int = 0, tag_type: str = 'status', user_id: str | None = None):
        if user_id is None:
            raise ValueError("user_id is required to create a tag")
        return self._repository.create(name=name, color=color, order=order, tag_type=tag_type, user_id=user_id)

    def update_tag(self, tag_id: str, name: str | None = None, color: str | None = None, user_id: str | None = None):
        return self._repository.update(tag_id, name=name, color=color, user_id=user_id)

    def delete_tag(self, tag_id: str, user_id: str | None = None):
        return self._repository.delete(tag_id, user_id=user_id)
