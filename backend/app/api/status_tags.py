from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_status_tag_service, get_work_service
from app.services.status_tag_service import StatusTagService
from app.services.work_service import WorkService

router = APIRouter(prefix='/tags', tags=['tags'])


def _to_dict(model):
    return {
        'id': model.id,
        'name': model.name,
        'color': model.color,
        'order': model.order,
        'category': getattr(model, 'type', None),
    }


@router.get('', response_model=list[dict])
def list_tags(service: StatusTagService = Depends(get_status_tag_service), tag_type: str | None = None):
    # If `tag_type` is provided, filter by it; otherwise return all tags.
    if tag_type:
        items = service.list_tags_by_type(tag_type)
    else:
        items = service.list_tags()
    return [_to_dict(t) for t in items]


@router.post('', status_code=status.HTTP_201_CREATED)
def create_tag(payload: dict, service: StatusTagService = Depends(get_status_tag_service)):
    name = payload.get('name')
    color = payload.get('color')
    # accept `category` in payload; service expects `tag_type`
    tag_type = payload.get('category', 'status')
    if not name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Name required')
    tag = service.create_tag(name=name.strip(), color=color or '#888888', tag_type=tag_type)
    return _to_dict(tag)


@router.patch('/{tag_id}')
def update_tag(tag_id: str, payload: dict, service: StatusTagService = Depends(get_status_tag_service)):
    name = payload.get('name')
    color = payload.get('color')
    updated = service.update_tag(tag_id, name=name, color=color)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Tag not found')
    return _to_dict(updated)


@router.delete('/{tag_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(tag_id: str, db: Session = Depends(get_db), tag_service: StatusTagService = Depends(get_status_tag_service), work_service: WorkService = Depends(get_work_service)):
    # If any works use this tag, move them to Todo before deletion
    # find Todo tag (in the 'status' type)
    todo = None
    for t in tag_service.list_tags_by_type('status'):
        if t.name.lower() == 'todo':
            todo = t
            break

    works = work_service.list_works()
    for w in works:
        if getattr(w, 'status_tag_id', None) == tag_id:
            if todo is not None:
                work_service.update_work_status(w.id, todo.id)

    deleted = tag_service.delete_tag(tag_id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Tag not found')
    return None
