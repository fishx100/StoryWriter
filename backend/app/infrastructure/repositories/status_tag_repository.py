from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.infrastructure.models import StatusTagModel


class SqlAlchemyStatusTagRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self, user_id: str | None = None) -> list[StatusTagModel]:
        # Only return tags owned by the specified user. Tags with no owner are ignored.
        if user_id is None:
            return []
        return (
            self._session.query(StatusTagModel)
            .filter(StatusTagModel.user_id == user_id)
            .order_by(StatusTagModel.order.asc())
            .all()
        )

    def list_by_type(self, tag_type: str, user_id: str | None = None) -> list[StatusTagModel]:
        # Only return tags of the requested type owned by the specified user. Ignore ownerless tags.
        if user_id is None:
            return []
        return (
            self._session.query(StatusTagModel)
            .filter(StatusTagModel.type == tag_type, StatusTagModel.user_id == user_id)
            .order_by(StatusTagModel.order.asc())
            .all()
        )

    def list_by_owner(self, user_id: str, tag_type: str) -> list[StatusTagModel]:
        return (
            self._session.query(StatusTagModel)
            .filter(StatusTagModel.type == tag_type, StatusTagModel.user_id == user_id)
            .order_by(StatusTagModel.order.asc())
            .all()
        )

    def get_by_id(self, tag_id: str) -> StatusTagModel | None:
        return self._session.get(StatusTagModel, tag_id)

    def get_by_name(self, name: str, tag_type: str | None = None, user_id: str | None = None) -> StatusTagModel | None:
        # Only consider user-owned tags. Ignore global/ownerless tags.
        if user_id is None or tag_type is None:
            return None
        return (
            self._session.query(StatusTagModel)
            .filter(StatusTagModel.name == name, StatusTagModel.type == tag_type, StatusTagModel.user_id == user_id)
            .first()
        )

    def create(self, name: str, color: str, order: int = 0, tag_type: str = 'status', user_id: str | None = None) -> StatusTagModel:
        # Require user_id for new tags; do not create ownerless/global tags.
        if user_id is None:
            raise ValueError("user_id is required when creating a StatusTag")
        model = StatusTagModel(name=name, color=color, order=order, type=tag_type, user_id=user_id)
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return model

    def update(self, tag_id: str, name: str | None = None, color: str | None = None, user_id: str | None = None) -> StatusTagModel | None:
        model = self._session.get(StatusTagModel, tag_id)
        if model is None:
            return None
        # Only allow owner to update
        if user_id is None or model.user_id != user_id:
            return None
        if name is not None:
            model.name = name
        if color is not None:
            model.color = color
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return model

    def delete(self, tag_id: str, user_id: str | None = None) -> bool:
        model = self._session.get(StatusTagModel, tag_id)
        if model is None:
            return False
        # Only owner may delete
        if user_id is None or model.user_id != user_id:
            return False
        self._session.delete(model)
        self._session.commit()
        return True
