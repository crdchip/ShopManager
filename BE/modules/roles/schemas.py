from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class PermissionInRole(BaseModel):
    idPermission: str = Field(..., description="Mã UUID của quyền")
    permKey: str = Field(..., description="Mã key định danh")
    permName: str = Field(..., description="Tên hiển thị của quyền")
    module: str = Field(..., description="Nhóm chức năng")

    class Config:
        from_attributes = True

# --- SCHEMAS CHO ROLE ---
class RoleBase(BaseModel):
    roleName: str = Field(..., description="Tên nhóm quyền", json_schema_extra={"example": "Nhân viên kho"})
    description: Optional[str] = Field(None, description="Mô tả nhiệm vụ", json_schema_extra={"example": "Quản lý xuất nhập hàng"})

class RoleCreate(BaseModel):
    roleName: str
    description: Optional[str] = None
    createdBy: Optional[str] = "admin"
    permissions: List[str] = []

class RoleUpdate(BaseModel):
    roleName: Optional[str] = None
    description: Optional[str] = None
    isActive: Optional[int] = None
    permissions: Optional[List[str]] = None

class RoleResponse(BaseModel):
    idRole: str = Field(..., description="Mã UUID của nhóm quyền")
    roleName: str = Field(..., description="Tên nhóm quyền")
    description: Optional[str] = None
    isActive: Optional[int] = 1
    createdAt: Optional[datetime] = None
    createdBy: Optional[str] = None
    
    permissions: List[PermissionInRole] = Field(default=[], description="Danh sách các quyền thuộc chức vụ")

    class Config:
        from_attributes = True
        
class RoleCreateOrUpdate(BaseModel):
    roleName: str
    description: Optional[str] = None
    permissions: List[str] = []

# --- SCHEMAS ĐỂ GÁN ROLE CHO USER ---
class AssignRolesInput(BaseModel):
    idRoleList: List[str] = Field(..., description="Danh sách các ID role muốn gán cho user")
    createdBy: Optional[str] = Field("admin", description="Người thực hiện gán quyền")