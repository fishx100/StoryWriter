from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_work_service
from app.infrastructure.models import SceneModel
from app.core.dependencies import get_db
from app.schemas.work import WorkCreate, WorkRead, WorkUpdate
from app.services.work_service import WorkService

router = APIRouter(prefix='/works', tags=['works'])


def _to_work_read(work) -> WorkRead:
	return WorkRead(
		id=str(work.id),
		title=work.title,
		premise=work.premise,
		genre=work.genre,
		status=work.status,
	)


@router.get('', response_model=list[WorkRead])
def list_works(work_service: WorkService = Depends(get_work_service)) -> list[WorkRead]:
	return [_to_work_read(work) for work in work_service.list_works()]


@router.get('/{work_id}', response_model=WorkRead)
def get_work(work_id: UUID, work_service: WorkService = Depends(get_work_service)) -> WorkRead:
	work = work_service.get_work(work_id)
	if work is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Work not found')
	return _to_work_read(work)


@router.post('', response_model=WorkRead, status_code=status.HTTP_201_CREATED)
def create_work(
	payload: WorkCreate,
	work_service: WorkService = Depends(get_work_service),
) -> WorkRead:
	if not payload.title.strip():
		raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Title is required')

	work = work_service.create_work(
		title=payload.title.strip(),
		premise=payload.premise.strip(),
		genre=payload.genre.strip(),
		status=payload.status,
	)
	return _to_work_read(work)


@router.patch('/{work_id}', response_model=WorkRead)
def update_work(
	work_id: UUID,
	payload: WorkUpdate,
	work_service: WorkService = Depends(get_work_service),
) -> WorkRead:
	work = work_service.get_work(work_id)
	if work is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Work not found')

	updated = work_service.update_work(
		work_id,
		title=payload.title.strip() if payload.title is not None else None,
		premise=payload.premise.strip() if payload.premise is not None else None,
		genre=payload.genre.strip() if payload.genre is not None else None,
		status=payload.status,
	)
	if updated is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Work not found')
	work = updated

	return _to_work_read(work)


@router.delete('/{work_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_work(
	work_id: UUID,
	work_service: WorkService = Depends(get_work_service),
	db: Session = Depends(get_db),
) -> None:
	existing_work = work_service.get_work(work_id)
	if existing_work is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Work not found')

	db.query(SceneModel).filter(SceneModel.work_id == str(work_id)).delete(synchronize_session=False)
	work_service.delete_work(work_id)
	return None
