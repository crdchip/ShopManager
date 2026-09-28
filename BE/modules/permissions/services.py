from sqlalchemy.orm import Session
from typing import List, Optional

from modules.permissions.models import Permission
from modules.roles.models import Role
from .repository import db_get_permissions, db_insert_permission, db_update_permission, db_delete_permission
from .schemas import PermissionCreate, PermissionUpdate

def list_permissions_service(db: Session, idPermission: Optional[str] = None):
    return db_get_permissions(db, idPermission)

def create_permission_service(db: Session, perm_data: PermissionCreate):
    return db_insert_permission(db, perm_data)

def update_permission_service(db: Session, idPermission: str, perm_in: PermissionUpdate):
    # Trích xuất các trường dữ liệu thực tế người dùng gửi lên để tránh đè Null dữ liệu cũ
    update_data = perm_in.model_dump(exclude_unset=True)
    return db_update_permission(db, idPermission, update_data)

def delete_permission_service(db: Session, idPermission: str):
    return db_delete_permission(db, idPermission)

def db_update_role_permissions(db: Session, idRole: str, role_name: str, desc: str, list_perm_ids: List[str]):
    db_role = db.query(Role).filter(Role.idRole == idRole).first()
    if not db_role:
        return None
    
    # Lấy các thực thể Permission có ID nằm trong danh sách truyền lên
    perm_objects = db.query(Permission).filter(Permission.idPermission.in_(list_perm_ids)).all()
    
    db_role.roleName = role_name
    db_role.description = desc
    db_role.permissions = perm_objects  # Gán trực tiếp mảng thực thể vào quan hệ Many-to-Many
    
    db.commit()
    db.refresh(db_role)
    return db_role