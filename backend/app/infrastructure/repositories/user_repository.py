from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.entities import User
from app.domain.repositories import UserRepository
from app.infrastructure.models import UserModel


class SqlAlchemyUserRepository(UserRepository):
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, user_id: UUID) -> User | None:
        model = self._session.get(UserModel, str(user_id))
        return self._to_domain(model) if model is not None else None

    def get_by_supabase_user_id(self, supabase_user_id: str) -> User | None:
        model = self._session.query(UserModel).filter(UserModel.supabase_user_id == supabase_user_id).one_or_none()
        return self._to_domain(model) if model is not None else None

    def create(self, user: User) -> User:
        model = UserModel(
            id=str(user.id),
            supabase_user_id=user.supabase_user_id,
            email=user.email,
        )
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_domain(model)

    def update(self, user: User) -> User:
        model = self._session.get(UserModel, str(user.id))
        if model is None:
            raise ValueError("User not found")

        model.supabase_user_id = user.supabase_user_id
        model.email = user.email
        self._session.add(model)
        self._session.commit()
        self._session.refresh(model)
        return self._to_domain(model)

    def _to_domain(self, model: UserModel) -> User:
        return User(
            id=UUID(model.id),
            supabase_user_id=model.supabase_user_id,
            email=model.email,
        )
