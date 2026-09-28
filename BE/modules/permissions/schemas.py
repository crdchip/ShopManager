from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class PermissionBase(BaseModel):
    permKey: str = Field(..., description="Mã key định danh quyền hạn", json_schema_extra={"example": "user_create"})
    permName: str = Field(..., description="Tên hiển thị của quyền", json_schema_extra={"example": "Thêm người dùng"})
    module: str = Field(..., description="Nhóm chức năng thuộc về", json_schema_extra={"example": "users"})

class PermissionCreate(PermissionBase):
    createdBy: Optional[str] = Field("admin", description="Người tạo quyền này", json_schema_extra={"example": "admin"})

class PermissionUpdate(BaseModel):
    permName: Optional[str] = Field(None, description="Tập cập nhật tên hiển thị", json_schema_extra={"example": "Chỉnh sửa người dùng"})
    module: Optional[str] = Field(None, description="Cập nhật nhóm chức năng", json_schema_extra={"example": "users"})
    # Nếu hệ thống cho phép đổi cả key thì bỏ comment dòng dưới
    # permKey: Optional[str] = Field(None, json_schema_extra={"example": "user_update"})

class PermissionResponse(PermissionBase):
    idPermission: str = Field(..., description="Mã UUID của quyền", json_schema_extra={"example": "85be8a3a-32db-4a11-ac62-108cb67ad84b"})
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    createdBy: Optional[str] = None

    class Config:
        from_attributes = True