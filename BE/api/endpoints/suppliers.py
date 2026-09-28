from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List, Union
from core.database import get_db
from modules.suppliers.services import list_suppliers_service, create_supplier_service, delete_supplier_service, update_supplier_service
from modules.suppliers.schemas import SupplierCreate, SupplierListResponse, SupplierResponse, SupplierUpdate, SupplierListResponse
from core.responses import success_response, error_response
from core.schemas import APIResponse    


router = APIRouter()

@router.get("/", response_model=SupplierListResponse)
def get_suppliers(db: Session = Depends(get_db), idSupplier: Optional[str] = None):
    try:
        data = list_suppliers_service(db, idSupplier)
        
        # Kiểm tra nếu không có dữ liệu
        if idSupplier and not data:
            return {
                "rCode": 0,
                "rMsg": "Không tìm thấy nhà cung cấp",
                "rData": None
            }
            
        return {
            "rCode": 1,
            "rMsg": "Thành công",
            "rData": data
        }
    except Exception as e:
        return {
            "rCode": 0,
            "rMsg": str(e),
            "rData": None
        }
    
@router.post("/add", response_model=SupplierResponse)
def add_supplier(supplier: SupplierCreate, db: Session = Depends(get_db)):  
    """
    **Thêm nhà cung cấp**:
    
    - **nameSupplier**: Tên nhà cung cấp (bắt buộc).
    - **contactInfo**: Thông tin liên hệ (số điện thoại hoặc email).
    - **addressSupplier**: Địa chỉ của nhà cung cấp.
    - **emailSupplier**: Email của nhà cung cấp.
    """
    try:
        db_supplier = create_supplier_service(db, supplier)
        return {
            "rCode": 1,
            "rMsg": "Tạo nhà cung cấp thành công",
            "rData": db_supplier
        }
    except HTTPException as e:
        # Chuyển HTTPException thành rCode 0 để FE dễ xử lý
        return {
            "rCode": 0,
            "rMsg": str(e.detail),
            "rData": None
        }
    
@router.put("/update/{idSupplier}", response_model=APIResponse[SupplierResponse])
def update_supplier(
    idSupplier: str, 
    supplier_in: SupplierUpdate, 
    db: Session = Depends(get_db)
):
    """
    **Cập nhật thông tin nhà cung cấp**:
    
    - Cho phép cập nhật một hoặc nhiều trường thông tin của nhà cung cấp.
    - Nếu trường nào không muốn cập nhật thì có thể bỏ qua (để nguyên giá trị cũ).
    """
    try:
        updated = update_supplier_service(db, idSupplier, supplier_in)
        return {
            "rCode": 1,
            "rMsg": "Cập nhật thành công",
            "rData": updated
        }
    except ValueError as e: 
        return {
            "rCode": 0,
            "rMsg": str(e), # Đây chính là nội dung: "Tên nhà cung cấp... đã bị trùng"
            "rData": None,
            "rError": "DuplicateError"
        }
    
@router.delete("/delete/{idSupplier}")
def delete_supplier(idSupplier: str, db: Session = Depends(get_db)):
    """
    **Xóa nhà cung cấp**:
    
    - Xóa nhà cung cấp theo `idSupplier`.
    - Nếu nhà cung cấp đang có sản phẩm liên kết thì sẽ không cho xóa để đảm bảo tính toàn vẹn dữ liệu.
    """
    try:
        deleted = delete_supplier_service(db, idSupplier)
        return {
            "rCode": 1,
            "rMsg": "Xóa nhà cung cấp thành công",
            "rData": deleted
        }
    except ValueError as e:
        return {
            "rCode": 0,
            "rMsg": str(e),
            "rData": None
        }