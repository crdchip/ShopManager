from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    userName: str = Field(..., min_length=3, description="Tên đăng nhập")
    fullName: Optional[str] = Field(None, description="Họ và tên")
    phone: Optional[str] = Field(None, description="Số điện thoại")
    
class UserLogin(BaseModel):
    userName: str = Field(..., min_length=3, description="Tên đăng nhập")
    password: str = Field(..., min_length=6, description="Mật khẩu")



# --- THÊM TRƯỜNG NHẬN TRUYỀN ID ROLES KHI TẠO ---
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Mật khẩu thô")
    createdBy: Optional[str] = Field("admin", description="Người tạo tài khoản")
    roles: Optional[List[str]] = Field(default=[], description="Danh sách idRole cần gán")

# --- THÊM TRƯỜNG NHẬN TRUYỀN ID ROLES KHI CẬP NHẬT ---
class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    phone: Optional[str] = None
    password: Optional[str] = None
    roles: Optional[List[str]] = Field(default=None, description="Danh sách idRole mới để cập nhật")
    
class UserRoleInUserResponse(BaseModel):
    idRole: str
    roleName: str
    roleShortName: Optional[str] = None
    description: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    idUsers: str
    userName: str
    fullName: Optional[str] = None
    phone: Optional[str] = None
    isActive: bool  
    createAt: Optional[datetime] = None
    roles: List[UserRoleInUserResponse] = []

    class Config:
        from_attributes = True
        
class TokenResponse(BaseModel):
    accessToken: str
    tokenType: str
    user: UserResponse 