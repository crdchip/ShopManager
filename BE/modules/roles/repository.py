import uuid
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List

from modules.roles.schemas import RoleCreate
from .models import Role, UserRole
from modules.permissions.models import Permission

# --- TÁC VỤ CRUD ROLE KÈM PERMISSIONS ---

def db_get_roles(db: Session, idRole: Optional[str] = None):
    """Lấy danh sách hoặc chi tiết Role kèm theo cấu hình Permissions của nó"""
    query = db.query(Role).options(joinedload(Role.permissions))
    if idRole:
        return query.filter(Role.idRole == idRole).first()
    return query.all()


def db_insert_role(db: Session, role_in: RoleCreate, perm_objects: List[Permission]):
    """Tạo mới Role và gán danh sách thực thể quyền vào bảng trung gian"""
    db_role = Role(
        idRole=str(uuid.uuid4()),
        roleName=role_in.roleName,
        description=role_in.description,
        createdBy=role_in.createdBy,
        permissions=perm_objects  # Gán trực tiếp mảng thực thể quyền
    )
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role


def db_update_role(db: Session, idRole: str, update_data: dict, perm_objects: Optional[List[Permission]] = None):
    """Cập nhật thông tin Role và đồng bộ lại danh sách quyền (Xóa cũ - Thêm mới tự động)"""
    db_role = db.query(Role).filter(Role.idRole == idRole).first()
    if not db_role:
        return None
        
    # Cập nhật các trường cơ bản (roleName, description, isActive...)
    for key, value in update_data.items():
        if hasattr(db_role, key):
            setattr(db_role, key, value)
            
    # Nếu phía Frontend có truyền mảng permissions (dù là mảng rỗng []), thực hiện đồng bộ
    if perm_objects is not None:
        db_role.permissions = perm_objects
        
    db.commit()
    db.refresh(db_role)
    return db_role

def db_delete_role(db: Session, role_obj: Role):
    """Xóa bỏ Role và tự động clear liên kết quyền hạn ở bảng trung gian"""
    id_deleted = role_obj.idRole
    
    # Nếu có quan hệ nhiều-nhiều với Permissions, cần clear list liên kết trước
    if hasattr(role_obj, 'permissions'):
        role_obj.permissions.clear()
        db.flush() 
        
    # Xóa thực thể chính
    db.delete(role_obj)
    db.commit()
    
    return id_deleted


# --- TÁC VỤ QUẢN LÝ USER_ROLES (Mối quan hệ Nhiều - Nhiều cũ giữ nguyên) ---

def db_get_roles_by_user(db: Session, idUsers: str) -> List[Role]:
    """Lấy danh sách toàn bộ các Role hiện tại của 1 User"""
    return db.query(Role).join(UserRole, Role.idRole == UserRole.idRole).filter(UserRole.idUsers == idUsers).all()


def db_sync_user_roles(db: Session, idUsers: str, id_role_list: List[str], creator: str):
    """Đồng bộ danh sách chức vụ của User (Xóa cũ - Thêm mới)"""
    db.query(UserRole).filter(UserRole.idUsers == idUsers).delete(synchronize_session=False)
    
    new_assignments = []
    for r_id in id_role_list:
        user_role_bind = UserRole(
            idUsers=idUsers,
            idRole=r_id,
            createdBy=creator
        )
        new_assignments.append(user_role_bind)
        
    db.add_all(new_assignments)
    db.commit()
    return True

def db_update_role_permissions(db: Session, idRole: str, list_perm_ids: list[str]):
    """Gán danh sách các idPermission vào một idRole cụ thể"""
    # 1. Tìm Role cần gán
    db_role = db.query(Role).filter(Role.idRole == idRole).first()
    if not db_role:
        return False
        
    # 2. Lấy danh sách các đối tượng Permission từ mảng ID truyền lên
    perm_objects = db.query(Permission).filter(Permission.idPermission.in_(list_perm_ids)).all()
    
    # 3. Gán trực tiếp mảng thực thể vào quan hệ Many-to-Many
    db_role.permissions = perm_objects
    
    db.commit()
    db.refresh(db_role)
    return True