import uuid
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List
from .models import User
from modules.roles.models import Role  # Import thêm Model Role để truy vấn đối tượng
from .schemas import UserCreate, UserLogin

def db_get_users(db: Session, idUsers: Optional[str] = None):
    # Eager Loading: Dùng joinedload để lấy kèm thông tin Roles luôn luôn sạch lỗi LazyLoad
    if idUsers:
        return db.query(User).options(joinedload(User.roles)).filter(User.idUsers == idUsers).first()
    return db.query(User).options(joinedload(User.roles)).all()

def db_insert_user(db: Session, user_in: UserCreate, hashed_password: str, role_objects: List[Role]):
    db_user = User(
        idUsers=str(uuid.uuid4()),
        userName=user_in.userName,
        passwordHash=hashed_password,
        fullName=user_in.fullName,
        phone=user_in.phone,
        createdBy=user_in.createdBy,
        roles=role_objects  # Gán trực tiếp danh sách thực thể Role đã tìm được
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def db_update_user(db: Session, idUser: str, update_data: dict, role_objects: Optional[List[Role]] = None):
    db_user = db.query(User).filter(User.idUsers == idUser).first()
    if not db_user:
        return None
        
    # Cập nhật các trường thông tin cơ bản
    for key, value in update_data.items():
        if hasattr(db_user, key):
            setattr(db_user, key, value)
            
    # Cập nhật/Đồng bộ lại danh sách vai trò (Nếu client có truyền lên mục roles)
    if role_objects is not None:
        db_user.roles = role_objects  # SQLAlchemy tự sinh lệnh DELETE cũ và INSERT mới
        
    db.commit()
    db.refresh(db_user)
    return db_user

def db_delete_user(db: Session, idUser: str):
    db_user = db.query(User).filter(User.idUsers == idUser).first()
    if db_user:
        db_user.isActive = 0 if db_user.isActive == 1 else 1
        db.commit()
        return True
    return False
def db_login_user(userName: str, db: Session):
    return db.query(User).filter(User.userName == userName).first()
            
         