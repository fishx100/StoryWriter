from collections.abc import Generator

from fastapi import Depends
from sqlalchemy.orm import Session

from app.infrastructure.database import SessionLocal
from app.infrastructure.repositories.work_repository import SqlAlchemyWorkRepository
from app.services.work_service import WorkService
from app.infrastructure.repositories.status_tag_repository import SqlAlchemyStatusTagRepository
from app.services.status_tag_service import StatusTagService
from fastapi import HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.supabase_auth import verify_supabase_jwt
from app.schemas.auth import AuthenticatedUser


def get_db() -> Generator[Session, None, None]:
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_work_service(db: Session = Depends(get_db)) -> WorkService:
    return WorkService(SqlAlchemyWorkRepository(db))


def get_status_tag_service(db: Session = Depends(get_db)) -> StatusTagService:
    return StatusTagService(SqlAlchemyStatusTagRepository(db))


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> AuthenticatedUser:
    if not credentials or credentials.scheme.lower() != 'bearer':
        raise HTTPException(status_code=401, detail='Unauthorized', headers={'WWW-Authenticate': 'Bearer'})

    token = credentials.credentials
    claims = verify_supabase_jwt(token)
    sub = claims.get('sub')
    email = claims.get('email')
    if not sub:
        raise HTTPException(status_code=401, detail='Invalid token')

    return AuthenticatedUser(supabase_user_id=sub, email=email)
