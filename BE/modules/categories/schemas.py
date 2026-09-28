from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# Schema cơ sở
class CategoryBase(BaseModel):
    nameCategory: str = Field(..., example="Điện thoại", description="Tên danh mục")
    description: Optional[str] = Field(None, example="Các dòng điện thoại thông minh")
    idParent: Optional[str] = Field(None, description="ID của danh mục cha nếu có")
    isActive: Optional[bool] = True

# Schema dùng khi tạo mới
class CategoryCreate(CategoryBase):
    createdBy: Optional[str] = None # UUID của người tạo

# Schema dùng khi cập nhật
class CategoryUpdate(BaseModel):
    nameCategory: Optional[str] = None
    description: Optional[str] = None
    idParent: Optional[str] = None
    isActive: Optional[bool] = None

# Schema trả về cho Client (Flutter)
class CategoryResponse(CategoryBase):
    idCategory: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None 
    createdBy: Optional[str]

    class Config:
        from_attributes = True