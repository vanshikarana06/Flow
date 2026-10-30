from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: Optional[str] = None
    correlation_id: Optional[str] = None

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    code: str
    details: Optional[Any] = None
    correlation_id: Optional[str] = None
