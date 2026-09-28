from sqlalchemy.orm import Session
from typing import Optional, List
from fastapi import HTTPException

from modules.roles.models import Role, RolePermission, UserRole

from .repository import (
    db_get_roles, 
    db_insert_role, 
    db_update_role,
    db_get_roles_by_user, 
    db_sync_user_roles,
    db_delete_role
)
from .schemas import RoleCreate, RoleUpdate
from modules.permissions.models import Permission

def list_roles_service(db: Session, idRole: Optional[str] = None):
    return db_get_roles(db, idRole)


def create_role_service(db: Session, role_data: RoleCreate):
    # 1. KIỂM TRA TRÙNG TÊN: Tìm xem trong DB đã có roleName này chưa
    existing_role = db.query(Role).filter(Role.roleName == role_data.roleName).first()
    if existing_role:
        # Chủ động ném lỗi 400 thay vì để DB crash lỗi 500 độc hại
        raise HTTPException(status_code=400, detail=f"Chức vụ '{role_data.roleName}' đã tồn tại trên hệ thống")

    # 2. Tìm kiếm danh sách thực thể Permission tương ứng từ mảng ID truyền lên
    perm_objects = []
    if role_data.permissions:
        perm_objects = db.query(Permission).filter(Permission.idPermission.in_(role_data.permissions)).all()
        
    return db_insert_role(db, role_data, perm_objects)


def update_role_service(db: Session, idRole: str, role_in: RoleUpdate):
    update_data = role_in.model_dump(exclude_unset=True)
    
    # Tách mảng "permissions" ra khỏi dict cập nhật dữ liệu của bảng Roles
    perm_ids = update_data.pop("permissions", None)
    perm_objects = None
    
    if perm_ids is not None:
        perm_objects = db.query(Permission).filter(Permission.idPermission.in_(perm_ids)).all()
        
    return db_update_role(db, idRole, update_data, perm_objects)

def delete_role_service(db: Session, idRole: str):
    # 1. Kiểm tra xem Role có tồn tại trên hệ thống hay không
    role_obj = db_get_roles(db, idRole=idRole)
    if not role_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy chức vụ yêu cầu hoặc chức vụ đã bị xóa trước đó")
        
    # 2. KIỂM TRA BẢO MẬT: Chức vụ này có đang được gán cho nhân viên nào không?
    # Giả sử quan hệ trong Model Role của bạn với bảng User được đặt tên thuộc tính là `users`
    if hasattr(role_obj, 'users') and len(role_obj.users) > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Không thể xóa! Hiện đang có {len(role_obj.users)} người dùng đang giữ chức vụ '{role_obj.roleName}'"
        )
        
    # 3. Tiến hành xóa ở tầng Repo
    return db_delete_role(db, role_obj)


def get_user_roles_service(db: Session, idUsers: str):
    return db_get_roles_by_user(db, idUsers)


def assign_user_roles_service(db: Session, idUsers: str, id_role_list: List[str], creator: str):
    return db_sync_user_roles(db, idUsers, id_role_list, creator)

def get_user_permission_keys(db: Session, idUsers: str) -> list[str]:
    """
    Truy vấn liên thông từ User -> User_Roles -> Roles -> Role_Permissions -> Permissions
    để lấy ra danh sách tất cả các mã permKey (Ví dụ: ['user_create', 'product_view'])
    """
    permissions = (
        db.query(Permission.permKey)
        .join(RolePermission, Permission.idPermission == RolePermission.idPermission)
        .join(Role, RolePermission.idRole == Role.idRole)
        .join(UserRole, Role.idRole == UserRole.idRole)
        .filter(UserRole.idUsers == idUsers)
        .all()
    )
    
    # Giải phẳng mảng tuple từ kết quả query của SQLAlchemy: [('perm_1',), ('perm_2',)] -> ['perm_1', 'perm_2']
    return [p[0] for p in permissions]