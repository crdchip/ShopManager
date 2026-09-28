from datetime import datetime
import uuid
from sqlalchemy.orm import Session
from typing import Optional
from .models import Units
from .schemas import UnitCreate,    UnitUpdate      ,   UnitResponse, UnitBase


# 1. Lấy danh sách (Chỉ lấy các đơn vị đang hoạt động)
def db_get_units(db: Session, idUnit: Optional[str] = None):
    if idUnit is not None:
        return db.query(Units).filter(Units.idUnit == idUnit).first()
    return db.query(Units).all()

# 2. Thêm mới đơn vị
def db_insert_unit(db: Session, unit_in: UnitCreate):   
    db_unit = Units(
        idUnit=str(uuid.uuid4()), # Tạo UUID mới
        unitName=unit_in.unitName,
        description=unit_in.description,
        isActive=unit_in.isActive,
        createdBy=unit_in.createdBy
    )
    db.add(db_unit)
    db.commit()
    db.refresh(db_unit)
    return db_unit  

# 3. Xóa đơn vị (Nên dùng Soft Delete/Xóa mềm)
def db_delete_unit(db: Session, idUnit: str):
    db_unit = db.query(Units).filter(Units.idUnit == idUnit).first()
    if db_unit:
        # Thay vì db.delete, ta cập nhật isActive = False
        db_unit.isActive = False
        db.commit()
        return True
    return False

# 4. Cập nhật thông tin
def db_update_unit(db: Session, idUnit: str, update_data: dict):    
    db_unit = db.query(Units).filter(Units.idUnit == idUnit).first()
    if not db_unit:
        return None
    
    # 1. Cập nhật các trường dữ liệu FE gửi lên
    for key, value in update_data.items():
        if hasattr(db_unit, key):
            setattr(db_unit, key, value)
    
    # 2. Chủ động cập nhật thời gian thay đổi bằng Python để tránh bị lỗi None
    db_unit.updatedAt = datetime.now()
    
    db.commit()
    db.refresh(db_unit)
    return db_unit

