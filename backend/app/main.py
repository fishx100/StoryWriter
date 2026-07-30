from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.infrastructure.database import create_tables

app = FastAPI(title='StoryWriter API')

app.add_middleware(
	CORSMiddleware,
	allow_origins=[settings.frontend_origin],
	allow_credentials=True,
	allow_methods=['*'],
	allow_headers=['*'],
)


@app.on_event('startup')
def on_startup() -> None:
	create_tables()


app.include_router(api_router)
