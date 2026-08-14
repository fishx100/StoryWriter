from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_current_user
from app.schemas.scene import SceneCreate, SceneRead, SceneReorder, SceneUpdate
from app.infrastructure.models import SceneModel, WorkModel
from app.schemas.auth import AuthenticatedUser

router = APIRouter(tags=['scenes'])


def _word_count(text: str) -> int:
	return len([word for word in text.split() if word])


def _to_scene_read(model: SceneModel) -> SceneRead:
	return SceneRead(
		id=str(model.id),
		title=model.title,
		summary=model.summary,
		content=model.content,
		status=model.status,
		order_index=int(model.order_index),
		word_count=_word_count(model.content),
	)


@router.get('/works/{work_id}/scenes', response_model=list[SceneRead])
def list_scenes(work_id: str, db: Session = Depends(get_db), current_user: AuthenticatedUser = Depends(get_current_user)) -> list[SceneRead]:
	work = db.get(WorkModel, work_id)
	if work is None or work.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Work not found')

	models = db.query(SceneModel).filter(SceneModel.work_id == work_id).order_by(SceneModel.order_index.asc()).all()
	return [_to_scene_read(m) for m in models]


@router.post('/works/{work_id}/scenes', response_model=SceneRead, status_code=status.HTTP_201_CREATED)
def create_scene(work_id: str, payload: SceneCreate, db: Session = Depends(get_db), current_user: AuthenticatedUser = Depends(get_current_user)) -> SceneRead:
	work = db.get(WorkModel, work_id)
	if work is None or work.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Work not found')
	# determine next order_index
	max_index = db.query(SceneModel).filter(SceneModel.work_id == work_id).order_by(SceneModel.order_index.desc()).first()
	next_index = max_index.order_index + 1 if max_index is not None else 0

	model = SceneModel(
		work_id=work_id,
		title=payload.title.strip() or 'Untitled scene',
		summary=payload.summary,
		content=payload.content,
		status=payload.status,
		order_index=next_index,
		word_count=_word_count(payload.content),
	)
	db.add(model)
	db.commit()
	db.refresh(model)
	return _to_scene_read(model)


@router.get('/works/{work_id}/scenes/{scene_id}', response_model=SceneRead)
def get_scene(work_id: str, scene_id: UUID, db: Session = Depends(get_db), current_user: AuthenticatedUser = Depends(get_current_user)) -> SceneRead:
	work = db.get(WorkModel, work_id)
	if work is None or work.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Scene not found')

	model = db.get(SceneModel, str(scene_id))
	if model is None or model.work_id != work_id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Scene not found')
	return _to_scene_read(model)


@router.patch('/scenes/{scene_id}', response_model=SceneRead)
def update_scene(scene_id: UUID, payload: SceneUpdate, db: Session = Depends(get_db), current_user: AuthenticatedUser = Depends(get_current_user)) -> SceneRead:
	model = db.get(SceneModel, str(scene_id))
	if model is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Scene not found')

	work = db.get(WorkModel, model.work_id)
	if work is None or work.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Scene not found')

	if payload.title is not None:
		model.title = payload.title.strip() or 'Untitled scene'
	if payload.summary is not None:
		model.summary = payload.summary
	if payload.content is not None:
		model.content = payload.content
		model.word_count = _word_count(payload.content)
	if payload.status is not None:
		model.status = payload.status

	db.add(model)
	db.commit()
	db.refresh(model)
	return _to_scene_read(model)


@router.delete('/scenes/{scene_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_scene(scene_id: str, db: Session = Depends(get_db), current_user: AuthenticatedUser = Depends(get_current_user)):
	model = db.get(SceneModel, scene_id)
	if model is None:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Scene not found')
	work = db.get(WorkModel, model.work_id)
	if work is None or work.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Scene not found')
	db.delete(model)
	db.commit()
	return None


@router.post('/works/{work_id}/scenes/reorder', status_code=status.HTTP_204_NO_CONTENT)
def reorder_scenes(work_id: str, payload: SceneReorder, db: Session = Depends(get_db), current_user: AuthenticatedUser = Depends(get_current_user)):
	work = db.get(WorkModel, work_id)
	if work is None or work.user_id != current_user.id:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Work not found')

	# Validate all ids belong to the work
	models = db.query(SceneModel).filter(SceneModel.work_id == work_id, SceneModel.id.in_(payload.order)).all()
	id_map = {m.id: m for m in models}
	if len(id_map) != len(payload.order):
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid scene id in order list')

	for idx, sid in enumerate(payload.order):
		m = id_map[sid]
		m.order_index = idx
		db.add(m)

	db.commit()
	return None
