from typing import Optional
from fastapi import HTTPException
from modules.units.models import Units
from .repository import db_get_units, db_insert_unit, db_delete_unit, db_update_unit
from .schemas import UnitCreate, UnitUpdate
from sqlalchemy.orm import Session

def list_units_service(db: Session, idUnit: Optional[str] = None):
    result = db_get_units(db, idUnit)
    
    if idUnit is not None and not result:
        return None 
        
    return result

def create_unit_service(db: Session, unit_data: UnitCreate):
    # Kiểm tra trùng tên đơn vị
    existing = db.query(Units).filter(
        Units.unitName == unit_data.unitName,
        Units.isActive == True
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Đơn vị '{unit_data.unitName}' đã tồn tại") 
    return db_insert_unit(db, unit_data)    
def update_unit_service(db: Session, idUnit: str, unit_in: UnitUpdate):
    update_data = unit_in.model_dump(exclude_unset=True)
    
    # Nếu cập nhật tên, kiểm tra xem có trùng với đơn vị khác không
    if "unitName" in update_data:
        existing = db.query(Units).filter(
            Units.unitName == update_data["unitName"], 
            Units.idUnit != idUnit,
            Units.isActive == True
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Tên đơn vị '{update_data['unitName']}' đã bị trùng")

    updated = db_update_unit(db, idUnit, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Đơn vị không tồn tại")
    return updated

def delete_unit_service(db: Session, idUnit: str):  
    # Ở đây có thể thêm check: Nếu đơn vị này đang được sử dụng trong sản phẩm nào đó thì không cho xóa
    success = db_delete_unit(db, idUnit)
    if not success:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn vị để xóa")
    return success  

        