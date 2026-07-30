from dataclasses import dataclass


@dataclass(slots=True)
class OrderedItem:
    order: int
