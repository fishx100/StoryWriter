from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities import Work
from app.domain.repositories import WorkRepository
from app.infrastructure.models import WorkModel


class SqlAlchemyWorkRepository(WorkRepository):
    def __init__(self, session: Session) -> None:
        self._session = session
        self._user_id: str | None = None

    def set_user(self, user_id: str) -> None:
        """Associate this repository instance with a local user id for scoping."""
        self._user_id = user_id

    def get_by_id(self, work_id: UUID) -> Work | None:
        # enforce ownership when a user is associated with this repository
        if self._user_id is not None:
            model = self._session.query(WorkModel).filter(WorkModel.id == str(work_id), WorkModel.user_id == self._user_id).one_or_none()
        else:
            model = self._session.get(WorkModel, str(work_id))
        return self._to_domain(model) if model is not None else None

    def list_all(self) -> list[Work]:
        q = self._session.query(WorkModel).order_by(WorkModel.created_at.desc())
        if self._user_id is not None:
            q = q.filter(WorkModel.user_id == self._user_id)
        models = q.all()
        return [self._to_domain(model) for model in models]

    def create(self, work: Work) -> Work:
        model = WorkModel(
            id=str(work.id),
            user_id=self._user_id,
            title=work.title,
            premise=work.premise,
            genre=work.genre,
            status_tag_id=work.status_tag_id,
        )
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_domain(model)

    def delete(self, work_id: UUID) -> bool:
        # ensure user can only delete their own work when scoped
        if self._user_id is not None:
            model = self._session.query(WorkModel).filter(WorkModel.id == str(work_id), WorkModel.user_id == self._user_id).one_or_none()
        else:
            model = self._session.get(WorkModel, str(work_id))
        if model is None:
            return False

        self._session.delete(model)
        self._session.commit()
        return True

    def update_status(self, work_id: UUID, status: str) -> Work | None:
        if self._user_id is not None:
            model = self._session.query(WorkModel).filter(WorkModel.id == str(work_id), WorkModel.user_id == self._user_id).one_or_none()
        else:
            model = self._session.get(WorkModel, str(work_id))
        if model is None:
            return None
        model.status_tag_id = status
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_domain(model)

    def update(
        self,
        work_id: UUID,
        title: str | None = None,
        premise: str | None = None,
        genre: str | None = None,
        status_tag_id: str | None = None,
    ) -> Work | None:
        if self._user_id is not None:
            model = self._session.query(WorkModel).filter(WorkModel.id == str(work_id), WorkModel.user_id == self._user_id).one_or_none()
        else:
            model = self._session.get(WorkModel, str(work_id))
        if model is None:
            return None

        if title is not None:
            model.title = title
        if premise is not None:
            model.premise = premise
        if genre is not None:
            model.genre = genre
        if status_tag_id is not None:
            model.status_tag_id = status_tag_id

        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_domain(model)

    def _to_domain(self, model: WorkModel) -> Work:
        return Work(
            id=UUID(model.id),
            title=model.title,
            premise=model.premise,
            genre=model.genre,
            status_tag_id=model.status_tag_id,
        )
