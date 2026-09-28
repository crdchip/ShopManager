import uuid
from sqlalchemy.orm import Session
from typing import Optional
from .models import Permission
from .schemas import PermissionCreate

def db_get_permissions(db: Session, idPermission: Optional[str] = None):
    if idPermission:
        return db.query(Permission).filter(Permission.idPermission == idPermission).first()
    return db.query(Permission).all()

def db_insert_permission(db: Session, perm_in: PermissionCreate):
    db_perm = Permission(
        idPermission=str(uuid.uuid4()),
        permKey=perm_in.permKey,       # Đã sửa lại đúng camelCase của Model
        permName=perm_in.permName,     # Đã sửa lại đúng camelCase của Model
        module=perm_in.module,
        createdBy=perm_in.createdBy
    )
    db.add(db_perm)
    db.commit()          # Thực hiện commit trước để DB tự tạo sinh dữ liệu TIMESTAMP
    db.refresh(db_perm)  # Refresh để nạp ngược lại dữ liệu tự sinh từ DB lên Python đối tượng
    return db_perm

def db_update_permission(db: Session, idPermission: str, update_data: dict):
    db_perm = db.query(Permission).filter(Permission.idPermission == idPermission).first()
    if not db_perm:
        return None
    for key, value in update_data.items():
        if hasattr(db_perm, key):
            setattr(db_perm, key, value)
    db.commit()
    db.refresh(db_perm)
    return db_perm

def db_delete_permission(db: Session, idPermission: str):
    db_perm = db.query(Permission).filter(Permission.idPermission == idPermission).first()
    if db_perm:
        db.delete(db_perm)
        db.commit()
        return True
    return False