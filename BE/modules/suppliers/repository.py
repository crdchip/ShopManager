import uuid
from sqlalchemy.orm import Session
from typing import Optional
from .models import Supplier
from .schemas import SupplierCreate

# 1. Lấy danh sách (Chỉ lấy các NCC đang hoạt động)
def db_get_suppliers(db: Session, idSuppliers: Optional[str] = None):
    if idSuppliers is not None:
        return db.query(Supplier).filter(Supplier.idSuppliers == idSuppliers).first()
    return db.query(Supplier).all()

# 2. Thêm mới nhà cung cấp
def db_insert_supplier(db: Session, supplier_in: SupplierCreate):   
    db_supplier = Supplier(
        idSuppliers=str(uuid.uuid4()), # Tạo UUID mới
        nameSuppliers=supplier_in.nameSuppliers,
        phoneSuppliers=supplier_in.phoneSuppliers,
        addressSupplie=supplier_in.addressSupplie, # Khớp tên cột trong ảnh
        emailSupplier=supplier_in.emailSupplier,
        taxCode=supplier_in.taxCode,
        contactPerson=supplier_in.contactPerson,
        bankAccount=supplier_in.bankAccount,
        isActive=True,
        createdBy=supplier_in.createdBy
    )
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier  

# 3. Xóa nhà cung cấp 
def db_delete_supplier(db: Session, idSuppliers: str):
    db_supplier = db.query(Supplier).filter(Supplier.idSuppliers == idSuppliers).first()
    if db_supplier:
        # Đảo ngược trạng thái: True thành False và ngược lại
        db_supplier.isActive = not db_supplier.isActive
        db.commit()
        return True
    return False

# 4. Cập nhật thông tin
def db_update_supplier(db: Session, idSuppliers: str, update_data: dict):    
    db_supplier = db.query(Supplier).filter(Supplier.idSuppliers == idSuppliers).first()
    if not db_supplier:
        return None
    
    for key, value in update_data.items():
        if hasattr(db_supplier, key):
            setattr(db_supplier, key, value)
    
    db.commit()
    db.refresh(db_supplier)
    return db_supplier