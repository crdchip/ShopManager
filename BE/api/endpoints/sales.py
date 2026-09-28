import jwt
from fastapi import APIRouter, Depends, status, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from modules.sales.schemas import SaleCreate, SaleResponse
from modules.sales.services import SaleService 
from core.responses import success_response, error_response
from core.config import settings

router = APIRouter()

def get_current_seller(authorization: str = Header(..., description="Chuỗi Bearer Token")):
    """
    Hàm Dependency bóc tách và giải mã chuỗi JWT từ Header 'Authorization'
    """
    # 1. Kiểm tra định dạng Header truyền lên có đúng chuẩn 'Bearer <Token>' hay không
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Định dạng Token không hợp lệ. Phải là 'Bearer <token>'"
        )
    
    # 2. Bóc lấy chuỗi token thô phía sau chữ Bearer
    token = authorization.split(" ")[1]
    
    try:
        # 3. Tiến hành giải mã và check xem token có bị hết hạn (exp) hay không
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        # 4. Trích xuất mã định danh idUsers được lưu tại trường 'sub' lúc login
        id_seller: str = payload.get("sub")
        if id_seller is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token không chứa thông tin định danh người dùng"
            )
            
        return id_seller  # Trả về ID người dùng thực tế đang thao tác

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Phiên làm việc đã hết hạn, vui lòng đăng nhập lại"
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token không hợp lệ hoặc đã bị thay đổi cấu trúc"
        )

# 1. API: Tạo hóa đơn bán lẻ tại quầy
@router.post("/invoice", status_code=status.HTTP_200_OK)
def create_sale_invoice(
    payload: SaleCreate, 
    db: Session = Depends(get_db),
    idSeller: str = Depends(get_current_seller)
):
    try:
        invoice = SaleService.create_new_sale(db, payload, idSeller)
        # Ép kiểu dữ liệu sang JSON sạch qua Schema trước khi return
        serialized_invoice = SaleResponse.model_validate(invoice).model_dump()
        return success_response(code=1, data=serialized_invoice, msg="Thanh toán hóa đơn thành công")
    except HTTPException as he:
        return error_response(code=0, msg=he.detail)
    except Exception as e:
        return error_response(code=0, msg=f"Lỗi xử lý hóa đơn bán hàng: {str(e)}")


# 2. API: Lấy danh sách lịch sử bán hàng (Đã cấu hình bốc mượt cả đơn vị tính)
@router.get("/invoice", status_code=status.HTTP_200_OK)
def get_all_sales_invoices(db: Session = Depends(get_db)):
    try:
        sales_history = SaleService.get_all_sales_history(db)
        if not sales_history:
            return success_response(code=1, data=[], msg="Lịch sử bán hàng trống")
            
        # SỬA LỖI: Ép toàn bộ danh sách bản ghi sang cấu trúc SaleResponse của Pydantic
        serialized_data = [SaleResponse.model_validate(item).model_dump() for item in sales_history]
        
        return success_response(code=1, data=serialized_data, msg="Lấy lịch sử bán hàng thành công")
    except Exception as e:
        return error_response(code=0, msg="Lỗi hệ thống khi tải danh sách bán hàng", error=str(e))


# 3. API: Chi tiết hóa đơn phục vụ việc click in lại hóa đơn cũ
@router.get("/invoice/{id_sale}", status_code=status.HTTP_200_OK)
def get_sale_invoice(id_sale: str, db: Session = Depends(get_db)):
    try:
        invoice = SaleService.get_sale_invoice_detail(db, id_sale)
        if not invoice:
            return error_response(code=0, msg="Không tìm thấy hóa đơn yêu cầu")
            
        # SỬA LỖI: Ép kiểu Object đơn lẻ sang cấu trúc SaleResponse sạch
        serialized_invoice = SaleResponse.model_validate(invoice).model_dump()
        
        return success_response(code=1, data=serialized_invoice, msg="Lấy dữ liệu hóa đơn thành công")
    except Exception as e:
        return error_response(code=0, msg="Lỗi truy vấn hệ thống", error=str(e))