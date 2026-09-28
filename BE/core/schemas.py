from typing import Generic, TypeVar, Optional, Any
from pydantic import BaseModel

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    rCode: int
    rMsg: str
    rData: Optional[T] = None
    rError: Optional[Any] = None

    class Config:
        # Giúp SQLAlchemy object tự chuyển đổi sang dict
        from_attributes = True


