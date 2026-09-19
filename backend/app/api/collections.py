from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, get_db
from app.infrastructure.models import CollectionItemModel, CollectionModel, WorkModel, StatusTagModel
from app.infrastructure.repositories.status_tag_repository import SqlAlchemyStatusTagRepository
from app.services.status_tag_service import StatusTagService
from app.schemas.auth import AuthenticatedUser
from app.schemas.collection import (
    CollectionCreate, CollectionItemCreate, CollectionItemRead,
    CollectionItemReorder, CollectionItemUpdate, CollectionRead,
)

router = APIRouter(tags=['collections'])

def _require_work(db: Session, work_id: str, user: AuthenticatedUser) -> None:
    work = db.get(WorkModel, work_id)
    if work is None or user.id is None or work.user_id != user.id:
        raise HTTPException(404, 'Work not found')


def _require_collection(db: Session, collection_id: str, user: AuthenticatedUser) -> CollectionModel:
    collection = db.get(CollectionModel, collection_id)
    if collection is None:
        raise HTTPException(404, 'Collection not found')
    _require_work(db, collection.work_id, user)
    return collection


def _read_item(item: CollectionItemModel) -> CollectionItemRead:
    return CollectionItemRead(
        id=item.id,
        name=item.name,
        description=item.description,
        order_index=item.order_index,
        status_tag_id=item.status_tag_id,
        fields=item.fields,
    )


def _read_collection(db: Session, collection: CollectionModel) -> CollectionRead:
    items = (
        db.query(CollectionItemModel)
        .filter_by(collection_id=collection.id)
        .order_by(CollectionItemModel.order_index, CollectionItemModel.id)
        .all()
    )
    return CollectionRead(
        id=collection.id, name=collection.name, template=collection.template,
        items=[_read_item(item) for item in items],
    )


def _require_definitions(fields: list[dict], definitions: list[dict]) -> None:
    copied = [{key: field[key] for key in ('id', 'label', 'type')} for field in fields]
    expected = [{key: field[key] for key in ('id', 'label', 'type')} for field in definitions]
    if copied != expected:
        raise HTTPException(422, 'Field definitions and order must match the stored blueprint')


def _resolve_status(db: Session, user: AuthenticatedUser, tag_id: UUID | None) -> str:
    if tag_id is not None:
        tag = db.get(StatusTagModel, str(tag_id))
        if tag is None or tag.user_id != user.id or tag.type != 'status':
            raise HTTPException(422, 'Choose a status belonging to the current user')
        return tag.id
    tags = StatusTagService(SqlAlchemyStatusTagRepository(db)).list_tags_by_type('status', user.id)
    return next(tag.id for tag in tags if tag.is_default)


@router.post('/works/{work_id}/collections', response_model=CollectionRead, status_code=201)
def create_collection(
    work_id: UUID, payload: CollectionCreate, response: Response,
    db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user),
) -> CollectionRead:
    _require_work(db, str(work_id), user)
    existing = db.query(CollectionModel).filter_by(work_id=str(work_id), name=payload.name).one_or_none()
    if existing is not None:
        response.status_code = 200
        return _read_collection(db, existing)
    collection = CollectionModel(work_id=str(work_id), name=payload.name, template=payload.template.model_dump())
    db.add(collection)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existing = db.query(CollectionModel).filter_by(work_id=str(work_id), name=payload.name).one_or_none()
        if existing is None:
            raise
        response.status_code = 200
        return _read_collection(db, existing)
    return _read_collection(db, collection)


@router.get('/works/{work_id}/collections', response_model=list[CollectionRead])
def list_collections(
    work_id: UUID, db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user),
) -> list[CollectionRead]:
    _require_work(db, str(work_id), user)
    collections = db.query(CollectionModel).filter_by(work_id=str(work_id)).order_by(CollectionModel.name).all()
    return [_read_collection(db, collection) for collection in collections]


@router.get('/collections/{collection_id}', response_model=CollectionRead)
def get_collection(
    collection_id: UUID, db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user),
) -> CollectionRead:
    return _read_collection(db, _require_collection(db, str(collection_id), user))


@router.post('/collections/{collection_id}/items', response_model=CollectionItemRead, status_code=201)
def create_item(
    collection_id: UUID, payload: CollectionItemCreate,
    db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user),
) -> CollectionItemRead:
    collection = _require_collection(db, str(collection_id), user)
    fields = [field.model_dump() for field in payload.fields]
    _require_definitions(fields, collection.template['fields'])
    status_tag_id = _resolve_status(db, user, payload.status_tag_id)
    db.query(CollectionItemModel).filter_by(collection_id=collection.id).update(
        {CollectionItemModel.order_index: CollectionItemModel.order_index + 1},
        synchronize_session=False,
    )
    item = CollectionItemModel(
        id=str(payload.id),
        collection_id=collection.id,
        name=payload.name,
        description=payload.description,
        order_index=0,
        status_tag_id=status_tag_id,
        fields=fields,
    )
    db.add(item)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, 'Unable to create item with this ID')
    return _read_item(item)


@router.patch('/collections/{collection_id}/items/{item_id}', response_model=CollectionItemRead)
def update_item(
    collection_id: UUID, item_id: UUID, payload: CollectionItemUpdate,
    db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user),
) -> CollectionItemRead:
    _require_collection(db, str(collection_id), user)
    item = db.get(CollectionItemModel, str(item_id))
    if item is None or item.collection_id != str(collection_id):
        raise HTTPException(404, 'Item not found')
    fields = [field.model_dump() for field in payload.fields]
    # Existing items are validated against their own snapshot, never today's template.
    _require_definitions(fields, item.fields)
    if 'status_tag_id' in payload.model_fields_set:
        if payload.status_tag_id is None:
            raise HTTPException(422, 'Status cannot be null')
        item.status_tag_id = _resolve_status(db, user, payload.status_tag_id)
    item.name = payload.name
    item.description = payload.description
    item.fields = fields
    db.commit()
    return _read_item(item)


@router.post('/collections/{collection_id}/items/reorder', status_code=204)
def reorder_items(
    collection_id: UUID, payload: CollectionItemReorder,
    db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user),
) -> None:
    collection = _require_collection(db, str(collection_id), user)
    requested = [str(item_id) for item_id in payload.order]
    items = db.query(CollectionItemModel).filter_by(collection_id=collection.id).all()
    current = {item.id: item for item in items}
    if len(requested) != len(set(requested)) or set(requested) != set(current):
        raise HTTPException(400, 'Order must contain every collection item exactly once')
    for index, item_id in enumerate(requested):
        current[item_id].order_index = index
    db.commit()
    return None


@router.delete('/collections/{collection_id}/items/{item_id}', status_code=204)
def delete_item(
    collection_id: UUID, item_id: UUID,
    db: Session = Depends(get_db), user: AuthenticatedUser = Depends(get_current_user),
) -> None:
    collection = _require_collection(db, str(collection_id), user)
    item = db.get(CollectionItemModel, str(item_id))
    if item is None or item.collection_id != collection.id:
        raise HTTPException(404, 'Item not found')
    deleted_index = item.order_index
    db.delete(item)
    db.query(CollectionItemModel).filter(
        CollectionItemModel.collection_id == collection.id,
        CollectionItemModel.order_index > deleted_index,
    ).update(
        {CollectionItemModel.order_index: CollectionItemModel.order_index - 1},
        synchronize_session=False,
    )
    db.commit()
    return None
