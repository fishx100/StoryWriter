from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities import Work
from app.domain.repositories import WorkRepository
from app.infrastructure.models import WorkModel


class SqlAlchemyWorkRepository(WorkRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, work_id: UUID) -> Work | None:
        model = self._session.get(WorkModel, str(work_id))
        return self._to_domain(model) if model is not None else None

    def list_all(self) -> list[Work]:
        models = self._session.query(WorkModel).order_by(WorkModel.created_at.desc()).all()
        return [self._to_domain(model) for model in models]

    def create(self, work: Work) -> Work:
        model = WorkModel(
            id=str(work.id),
            title=work.title,
            premise=work.premise,
            genre=work.genre,
            status=work.status,
        )
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_domain(model)

    def delete(self, work_id: UUID) -> bool:
        model = self._session.get(WorkModel, str(work_id))
        if model is None:
            return False

        self._session.delete(model)
        self._session.commit()
        return True

    def update_status(self, work_id: UUID, status: str) -> Work | None:
        model = self._session.get(WorkModel, str(work_id))
        if model is None:
            return None

        model.status = status
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
        status: str | None = None,
    ) -> Work | None:
        model = self._session.get(WorkModel, str(work_id))
        if model is None:
            return None

        if title is not None:
            model.title = title
        if premise is not None:
            model.premise = premise
        if genre is not None:
            model.genre = genre
        if status is not None:
            model.status = status

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
            status=model.status,
        )
