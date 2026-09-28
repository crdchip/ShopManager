from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from core.database import get_db
from modules.orders.schemas import PurchaseOrderCreate
from modules.orders.services import OrderService 

from core.responses import success_response, error_response

router = APIRouter()

# 1. API: Tạo mới một đơn nhập hàng
@router.post("/purchase", status_code=status.HTTP_200_OK)
def create_purchase_order(payload: PurchaseOrderCreate, db: Session = Depends(get_db)):
    
    try:
        order = OrderService.create_new_order(db, payload)
        return success_response(code=1, data=order, msg="Tạo đơn hàng thành công")
    except Exception as e:
        return error_response(code=0, msg=f"Lỗi tạo đơn đặt hàng: {str(e)}")


# 2. API: Lấy TOÀN BỘ danh sách đơn nhập hàng (Phần bị thiếu)
@router.get("/purchase", status_code=status.HTTP_200_OK)
def get_all_purchase_orders(db: Session = Depends(get_db)):
    try:
        # Gọi xuống Service để quét toàn bộ dữ liệu từ bảng PurchaseOrders
        orders = OrderService.get_all_orders(db) 
        
        if not orders:
            return success_response(code=1, data=[], msg="Danh sách đơn nhập hàng trống")
            
        return success_response(code=1, data=orders, msg="Lấy danh sách đơn nhập thành công")
    except Exception as e:
        return error_response(code=0, msg="Lỗi hệ thống khi lấy danh sách đơn hàng", error=str(e))


# 3. API: Lấy chi tiết 1 đơn nhập hàng theo ID (Dùng khi bấm Modal xem chi tiết)
@router.get("/purchase/{id_po}", status_code=status.HTTP_200_OK)
def get_purchase_order(id_po: str, db: Session = Depends(get_db)):
    try:
        # Sửa lại lệnh gọi tại đây cho đồng bộ với Service vừa sửa ở Bước 2
        order = OrderService.get_order_detail(db, id_po)
        if not order:
            return error_response(code=0, msg="Không tìm thấy đơn hàng yêu cầu")
            
        return success_response(code=1, data=order, msg="Lấy chi tiết đơn hàng thành công")
    except Exception as e:
        return error_response(code=0, msg="Lỗi hệ thống", error=str(e))