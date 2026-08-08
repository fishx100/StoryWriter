from fastapi import APIRouter

from app.api.auth import router as auth_router
from app.api.characters import router as characters_router
from app.api.chapters import router as chapters_router
from app.api.health import router as health_router
from app.api.notes import router as notes_router
from app.api.plot_beats import router as plot_beats_router
from app.api.scenes import router as scenes_router
from app.api.timeline_events import router as timeline_events_router
from app.api.works import router as works_router
from app.api.status_tags import router as status_tags_router

api_router = APIRouter(prefix='/api')
api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(works_router)
api_router.include_router(status_tags_router)
api_router.include_router(chapters_router)
api_router.include_router(scenes_router)
api_router.include_router(characters_router)
api_router.include_router(timeline_events_router)
api_router.include_router(plot_beats_router)
api_router.include_router(notes_router)
