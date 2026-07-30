from pydantic import BaseModel


class TimelineEventBase(BaseModel):
    title: str
    summary: str = ''
    order: int = 0
