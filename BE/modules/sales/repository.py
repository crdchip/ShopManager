import uuid
from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload
from modules.sales.models import Sale, SaleDetail
from modules.sales.schemas import SaleCreate
from modules.products.models import Product, ProductUnit

class SaleRepository:
    
    @staticmethod
    def create_sale_invoice(db: Session, obj_in: SaleCreate, id_seller: str) -> Sale:
        # 1. Khai báo điểm lưu (Transaction bắt đầu)
        db_sale = Sale(
            idSale=str(uuid.uuid4()),
            totalAmount=0.00,
            idSeller=id_seller
        )
        total_amount = 0
        
        try:
            # 2. Duyệt giỏ hàng từ quầy POS đẩy lên
            for item in obj_in.items:
                detail_cost = item.quantity * item.unitPrice
                total_amount += detail_cost
                
                db_detail = SaleDetail(
                    idSaleDetail=str(uuid.uuid4()),
                    idSale=db_sale.idSale,
                    idProduct=item.idProduct,
                    idProductUnit=item.idProductUnit, 
                    quantity=item.quantity,
                    unitPrice=item.unitPrice
                )
                db_sale.details.append(db_detail)
                
                # --- LOGIC TỰ ĐỘNG TRỪ TỒN KHO GỐC THEO QUY CÁCH ---
                product = db.query(Product).filter(Product.idProduct == item.idProduct).first()
                if not product:
                    # Ngăn chặn việc bán một mặt hàng đã bị xóa ở backend
                    raise HTTPException(status_code=400, detail=f"Sản phẩm ID {item.idProduct} không tồn tại trên hệ thống.")
                
                conversion_factor = 1.0
                
                # Nếu có chọn đơn vị quy đổi (Ví dụ: Thùng / Lốc thay vì Chai gốc)
                if item.idProductUnit:
                    unit_config = db.query(ProductUnit).filter(ProductUnit.idProductUnit == item.idProductUnit).first()
                    if unit_config:
                        conversion_factor = float(unit_config.conversionFactor or 1)
                
                # Tính toán số lượng gốc cần khấu trừ thực tế
                actual_qty_deducted = float(item.quantity) * conversion_factor
                
                # Tiến hành trừ trực tiếp vào kho tổng sản phẩm
                product.currentStock = float(product.currentStock or 0) - actual_qty_deducted
                # --------------------------------------------------
                
            db_sale.totalAmount = total_amount
            
            db.add(db_sale)
            db.commit() # Chỉ ghi nhận khi toàn bộ vòng lặp chạy mượt mà
            db.refresh(db_sale)
            return db_sale
            
        except Exception as e:
            db.rollback() # Hoàn nguyên dữ liệu kho bãi nếu xảy ra bất cứ lỗi gì đột xuất
            raise e

    @staticmethod
    def get_all_sales(db: Session):
        """Lấy lịch sử bán hàng kèm thông tin chi tiết sản phẩm & quy cách đơn vị"""
        return db.query(Sale).\
            options(
                joinedload(Sale.details).joinedload(SaleDetail.product),
                joinedload(Sale.details).joinedload(SaleDetail.product_unit)
            ).\
            order_by(Sale.saleDate.desc()).all()

    @staticmethod
    def get_sale_by_id(db: Session, id_sale: str):
        """Lấy chi tiết 1 hóa đơn cụ thể phục vụ việc hiển thị hoặc in lại hóa đơn lẻ"""
        return db.query(Sale).\
            options(
                joinedload(Sale.details).joinedload(SaleDetail.product),
                joinedload(Sale.details).joinedload(SaleDetail.product_unit)
            ).\
            filter(Sale.idSale == id_sale).first() 