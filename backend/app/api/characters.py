from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db
from app.infrastructure.models import CharacterModel
from app.schemas.character import CharacterCreate, CharacterRead, CharacterReorder

router = APIRouter(tags=['characters'])

def _to_character_read(model: CharacterModel) -> CharacterRead:
    return CharacterRead(
        id=str(model.id),
        work_id=str(model.work_id),
        name=model.name,
        description=model.description,
        order_index=int(model.order_index),
    )


@router.get('/works/{work_id}/characters', response_model=list[CharacterRead])
def list_characters(work_id: str, db: Session = Depends(get_db)) -> list[CharacterRead]:
    models = db.query(CharacterModel).filter(CharacterModel.work_id == work_id).order_by(CharacterModel.order_index.asc()).all()
    return [_to_character_read(m) for m in models]

@router.post('/works/{work_id}/characters', response_model=CharacterRead, status_code=status.HTTP_201_CREATED)
def create_character(work_id: str, payload: CharacterCreate, db: Session = Depends(get_db)) -> CharacterRead:
    # determine next order_index
    max_index = db.query(CharacterModel).filter(CharacterModel.work_id == work_id).order_by(CharacterModel.order_index.desc()).first()
    next_index = max_index.order_index + 1 if max_index is not None else 0

    model = CharacterModel(
        work_id=work_id,
        name=payload.name.strip() or 'Unnamed character',
        description=payload.description,
        order_index=next_index,
    )
    db.add(model)
    db.commit()
    db.refresh(model)
    return _to_character_read(model)

@router.patch('/works/{work_id}/characters/{character_id}', response_model=CharacterRead)
def update_character(work_id: str, character_id: str, payload: CharacterCreate, db: Session = Depends(get_db)) -> CharacterRead:
    model = db.get(CharacterModel, character_id)
    if model is None or model.work_id != work_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Character not found')

    if payload.name is not None:
        model.name = payload.name.strip() or 'Unnamed character'
    if payload.description is not None:
        model.description = payload.description

    db.add(model)
    db.commit()
    db.refresh(model)
    return _to_character_read(model)

@router.delete('/works/{work_id}/characters/{character_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_character(work_id: str, character_id: str, db: Session = Depends(get_db)) -> None:
    model = db.get(CharacterModel, character_id)
    if model is None or model.work_id != work_id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Character not found')

    db.delete(model)
    db.commit()
    return None

@router.post('/works/{work_id}/characters/reorder', status_code=status.HTTP_204_NO_CONTENT)
def reorder_characters(work_id: str, payload: CharacterReorder, db: Session = Depends(get_db)) -> None:
    models = db.query(CharacterModel).filter(CharacterModel.work_id == work_id).all()
    model_dict = {str(m.id): m for m in models}

    if set(payload.order) != set(model_dict.keys()):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='Invalid character order')

    for index, character_id in enumerate(payload.order):
        model = model_dict[character_id]
        model.order_index = index
        db.add(model)

    db.commit()
    return None