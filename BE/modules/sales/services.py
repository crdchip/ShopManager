from sqlalchemy.orm import Session
from modules.sales.repository import SaleRepository
from modules.sales.schemas import SaleCreate

class SaleService:
    
    @staticmethod
    def create_new_sale(db: Session, payload: SaleCreate, id_seller: str):
        """Điều hướng xử lý hóa đơn bán hàng & khấu trừ tồn kho gốc"""
        return SaleRepository.create_sale_invoice(db, payload, id_seller)

    @staticmethod
    def get_all_sales_history(db: Session):
        """Điều hướng lấy lịch sử giao dịch tại quầy"""
        return SaleRepository.get_all_sales(db)

    @staticmethod
    def get_sale_invoice_detail(db: Session, id_sale: str):
        """Bốc dữ liệu hóa đơn chi tiết phục vụ in ấn biên lai"""
        return SaleRepository.get_sale_by_id(db, id_sale)