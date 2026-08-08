from uuid import UUID

from sqlalchemy.orm import Session

from app.infrastructure.models import StatusTagModel


class SqlAlchemyStatusTagRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def list_all(self) -> list[StatusTagModel]:
        return self._session.query(StatusTagModel).order_by(StatusTagModel.order.asc()).all()

    def list_by_type(self, tag_type: str) -> list[StatusTagModel]:
        return self._session.query(StatusTagModel).filter(StatusTagModel.type == tag_type).order_by(StatusTagModel.order.asc()).all()

    def get_by_id(self, tag_id: str) -> StatusTagModel | None:
        return self._session.get(StatusTagModel, tag_id)

    def get_by_name(self, name: str, tag_type: str | None = None) -> StatusTagModel | None:
        q = self._session.query(StatusTagModel).filter(StatusTagModel.name == name)
        if tag_type is not None:
            q = q.filter(StatusTagModel.type == tag_type)
        return q.first()

    def create(self, name: str, color: str, order: int = 0, tag_type: str = 'status') -> StatusTagModel:
        model = StatusTagModel(name=name, color=color, order=order, type=tag_type)
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return model

    def update(self, tag_id: str, name: str | None = None, color: str | None = None) -> StatusTagModel | None:
        model = self._session.get(StatusTagModel, tag_id)
        if model is None:
            return None
        if name is not None:
            model.name = name
        if color is not None:
            model.color = color
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return model

    def delete(self, tag_id: str) -> bool:
        model = self._session.get(StatusTagModel, tag_id)
        if model is None:
            return False
        self._session.delete(model)
        self._session.commit()
        return True
