from sqlalchemy.orm import Session
from modules.orders.repository import OrderRepository
from modules.orders.schemas import PurchaseOrderCreate

class OrderService:
    
    @staticmethod
    def create_new_order(db: Session, payload: PurchaseOrderCreate):
        """Gọi sang Repo để xử lý tạo đơn nhập hàng & cộng dồn tồn kho"""
        return OrderRepository.create_purchase_order(db, payload)

    @staticmethod
    def get_all_orders(db: Session):
        """Gọi sang Repo để quét toàn bộ danh sách đơn nhập kèm mối quan hệ"""
        return OrderRepository.get_all_orders(db)

    @staticmethod
    def get_order_detail(db: Session, id_po: str):
        """Gọi sang Repo để bốc chi tiết đơn hàng hiển thị lên Modal"""
        return OrderRepository.get_by_id(db, id_po)