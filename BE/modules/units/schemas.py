from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime

class UnitBase(BaseModel):
    unitName: str
    description: Optional[str] = None
    isActive: bool = True

class UnitCreate(UnitBase):
    createdBy: Optional[str] = None

class UnitUpdate(BaseModel):
    unitName: Optional[str] = None
    description: Optional[str] = None
    isActive: Optional[bool] = None

class UnitResponse(UnitBase):
    idUnit: str
    # Sử dụng Optional để tránh lỗi nghiêm trọng khi driver DB trả về None tạm thời
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    createdBy: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)