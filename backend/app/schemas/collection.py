from math import isfinite
from typing import Literal
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, JsonValue, model_validator


class FieldDefinition(BaseModel):
    model_config = ConfigDict(extra='forbid')

    id: str = Field(min_length=1)
    label: str
    type: Literal['text', 'textarea', 'number', 'checkbox']


class CollectionTemplate(BaseModel):
    fields: list[FieldDefinition]


class ItemField(FieldDefinition):
    value: JsonValue

    @model_validator(mode='after')
    def validate_value(self):
        if self.type in ('text', 'textarea'):
            if not isinstance(self.value, str):
                raise ValueError('Text fields require a string value')
        elif self.type == 'checkbox':
            if not isinstance(self.value, bool):
                raise ValueError('Checkbox fields require a boolean value')
        elif self.value is not None:
            if type(self.value) not in (int, float) or not isfinite(self.value):
                raise ValueError('Number fields require a finite number or null')
        return self


class CollectionItemUpdate(BaseModel):
    model_config = ConfigDict(extra='forbid')

    name: str
    description: str = ''
    fields: list[ItemField]

    @model_validator(mode='after')
    def unique_field_ids(self):
        ids = [field.id for field in self.fields]
        if len(ids) != len(set(ids)):
            raise ValueError('Field IDs must be unique')
        return self


class CollectionItemCreate(CollectionItemUpdate):
    id: UUID = Field(default_factory=uuid4)


class CollectionItemRead(BaseModel):
    id: str
    name: str
    description: str
    order_index: int
    fields: list[ItemField]


class CollectionItemReorder(BaseModel):
    model_config = ConfigDict(extra='forbid')

    order: list[UUID]


class CollectionCreate(BaseModel):
    model_config = ConfigDict(extra='forbid')

    name: str
    template: CollectionTemplate


class CollectionRead(BaseModel):
    id: str
    name: str
    template: CollectionTemplate
    items: list[CollectionItemRead]
