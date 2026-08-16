from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, get_status_tag_service, get_work_service, get_current_user
from app.services.status_tag_service import StatusTagService
from app.services.work_service import WorkService
from app.schemas.auth import AuthenticatedUser

router = APIRouter(prefix='/tags', tags=['tags'])


def _to_dict(model):
    return {
        'id': model.id,
        'name': model.name,
        'color': model.color,
        'order': model.order,
        'category': getattr(model, 'type', None),
        'user_id': getattr(model, 'user_id', None),
    }


@router.get('', response_model=list[dict])
def list_tags(service: StatusTagService = Depends(get_status_tag_service), current_user: AuthenticatedUser = Depends(get_current_user), tag_type: str | None = None):
    # If `tag_type` is provided, filter by it; otherwise return all tags.
    user_id = current_user.id
    if tag_type:
        items = service.list_tags_by_type(tag_type, user_id=user_id)
    else:
        items = service.list_tags(user_id=user_id)
    return [_to_dict(t) for t in items]


@router.post('', status_code=status.HTTP_201_CREATED)
def create_tag(payload: dict, service: StatusTagService = Depends(get_status_tag_service), current_user: AuthenticatedUser = Depends(get_current_user)):
    name = payload.get('name')
    color = payload.get('color')
    # accept `category` in payload; service expects `tag_type`
    tag_type = payload.get('category', 'status')
    if not name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail='Name required')
    tag = service.create_tag(name=name.strip(), color=color or '#888888', tag_type=tag_type, user_id=current_user.id)
    return _to_dict(tag)


@router.patch('/{tag_id}')
def update_tag(tag_id: str, payload: dict, service: StatusTagService = Depends(get_status_tag_service), current_user: AuthenticatedUser = Depends(get_current_user)):
    name = payload.get('name')
    color = payload.get('color')
    updated = service.update_tag(tag_id, name=name, color=color, user_id=current_user.id)
    if updated is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Tag not found')
    return _to_dict(updated)


@router.delete('/{tag_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_tag(tag_id: str, db: Session = Depends(get_db), tag_service: StatusTagService = Depends(get_status_tag_service), work_service: WorkService = Depends(get_work_service), current_user: AuthenticatedUser = Depends(get_current_user)):
    # If any works use this tag, move them to Todo before deletion
    # find Todo tag (in the 'status' type)
    todo = None
    for t in tag_service.list_tags_by_type('status', user_id=current_user.id):
        if t.name.lower() == 'todo':
            todo = t
            break

    # only affect works owned by the current user
    works = [w for w in work_service.list_works() if getattr(w, 'user_id', None) == current_user.id]
    for w in works:
        if getattr(w, 'status_tag_id', None) == tag_id:
            if todo is not None:
                work_service.update_work_status(w.id, todo.id)

    deleted = tag_service.delete_tag(tag_id, user_id=current_user.id)
    if not deleted:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail='Tag not found')
    return None
