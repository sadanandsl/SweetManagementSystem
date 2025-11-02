from typing import Optional
from pydantic import BaseModel, ConfigDict


class SweetCreate(BaseModel):
    name: str
    category: Optional[str] = None
    price: float
    quantity: int


class SweetResponse(BaseModel):
    id: int
    name: str
    category: Optional[str] = None
    price: float
    quantity: int

    model_config = ConfigDict(from_attributes=True)
