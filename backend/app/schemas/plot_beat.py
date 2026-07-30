from pydantic import BaseModel


class PlotBeatBase(BaseModel):
    title: str
    description: str = ''
    order: int = 0
