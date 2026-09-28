from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from .repository import db_get_suppliers, db_insert_supplier, db_delete_supplier, db_update_supplier
from .schemas import SupplierCreate, SupplierUpdate
from .models import Supplier

def list_suppliers_service(db: Session, idSuppliers: Optional[str] = None):
    result = db_get_suppliers(db, idSuppliers)
    
    if idSuppliers is not None and not result:
        return None 
        
    return result

def create_supplier_service(db: Session, supplier_data: SupplierCreate):
    # Kiểm tra trùng tên nhà cung cấp
    existing = db.query(Supplier).filter(
        Supplier.nameSuppliers == supplier_data.nameSuppliers
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Nhà cung cấp '{supplier_data.nameSuppliers}' đã tồn tại") 

    return db_insert_supplier(db, supplier_data)    

def update_supplier_service(db: Session, idSuppliers: str, supplier_in: SupplierUpdate):
    update_data = supplier_in.model_dump(exclude_unset=True)
    
    # Nếu cập nhật tên, kiểm tra xem có trùng với NCC khác không
    if "nameSuppliers" in update_data:
        existing = db.query(Supplier).filter(
            Supplier.nameSuppliers == update_data["nameSuppliers"], 
            Supplier.idSuppliers != idSuppliers
        ).first()
        if existing:
            raise ValueError(f"Tên nhà cung cấp '{update_data['nameSuppliers']}' đã bị trùng")

    updated = db_update_supplier(db, idSuppliers, update_data)
    if not updated:
        raise ValueError("Nhà cung cấp không tồn tại")
    return updated

def delete_supplier_service(db: Session, idSuppliers: str):  
    # Ở đây có thể thêm check: Nếu NCC này đang có đơn nhập hàng (PO) thì không cho xóa
    success = db_delete_supplier(db, idSuppliers)
    if not success:
        raise ValueError(f"Không tìm thấy nhà cung cấp để xóa")
    return success