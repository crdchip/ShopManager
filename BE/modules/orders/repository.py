import uuid
from sqlalchemy.orm import Session, joinedload
from modules.orders.models import PurchaseOrder, PurchaseDetail
from modules.orders.schemas import PurchaseOrderCreate
from modules.products.models import Product, ProductUnit 

class OrderRepository:
    
    @staticmethod
    def create_purchase_order(db: Session, obj_in: PurchaseOrderCreate) -> PurchaseOrder:
        supplier_id = obj_in.idSuppliers if obj_in.idSuppliers and obj_in.idSuppliers.strip() != "" else None
        # 1. Khởi tạo Đơn nhập tổng
        db_order = PurchaseOrder(
            idPurchaseOrder=str(uuid.uuid4()),
            poNumber=obj_in.poNumber,
            idSuppliers=supplier_id,
            note=obj_in.note,
            createdBy=obj_in.createdBy,
            status=1, 
            paymentStatus=1,
            totalCost=0.00 
        )
        
        total_cost = 0
        
        # 2. Duyệt qua từng sản phẩm trong giỏ hàng gửi từ Frontend
        for item in obj_in.items:
            detail_cost = item.quantity * item.importPrice
            total_cost += detail_cost
            
            db_detail = PurchaseDetail(
                idPurchaseDetail=str(uuid.uuid4()),
                idPurchaseOrder=db_order.idPurchaseOrder,
                idProduct=item.idProduct,
                idProductUnit=item.idProductUnit, # Lưu trữ vết quy đổi để kiểm kê sau này
                quantity=item.quantity,
                receivedQuantity=0.00, 
                importPrice=item.importPrice,
                expiryDate=item.expiryDate,
                batchNumber=item.batchNumber
            )
            db_order.details.append(db_detail)
            
            # --- LOGIC KIỂM TỒN KHO DỰA VÀO QUY CÁCH ĐÃ CHỌN ---
            product = db.query(Product).filter(Product.idProduct == item.idProduct).first()
            if product:
                conversion_factor = 1.0
                
                if item.idProductUnit:
                    unit_config = db.query(ProductUnit).filter(ProductUnit.idProductUnit == item.idProductUnit).first()
                    if unit_config:
                        # Ép kiểu Decimal từ DB về float để tính toán an toàn với item.quantity
                        conversion_factor = float(unit_config.conversionFactor or 1)
                
                actual_qty_added = float(item.quantity) * conversion_factor
                
                # Cộng dồn vào kho gốc của sản phẩm
                product.currentStock = float(product.currentStock or 0) + actual_qty_added
            # --------------------------------------------------
            
            # Tự động cập nhật lại giá nhập gốc nếu được tích chọn
            if item.isUpdateBasePrice:
                if item.idProductUnit:
                    db.query(ProductUnit).filter(ProductUnit.idProductUnit == item.idProductUnit).update({"purchasePrice": item.importPrice})
                db.query(Product).filter(Product.idProduct == item.idProduct).update({"purchasePrice": item.importPrice})
            
        db_order.totalCost = total_cost
        
        db.add(db_order)
        db.commit()
        db.refresh(db_order)
        return db_order

    @staticmethod
    def get_all_orders(db: Session):
        return db.query(PurchaseOrder).\
            options(
                # 1. Nạp thông tin nhà cung cấp của đơn tổng
                joinedload(PurchaseOrder.supplier),
                
                # 2. Nạp mảng danh sách chi tiết (details) -> Rồi nạp tiếp thông tin sản phẩm (product)
                joinedload(PurchaseOrder.details).joinedload(PurchaseDetail.product),
                
                # 3. Nạp mảng danh sách chi tiết (details) -> Rồi nạp tiếp đơn vị quy đổi (product_unit)
                joinedload(PurchaseOrder.details).joinedload(PurchaseDetail.product_unit)
            ).\
            order_by(PurchaseOrder.updatedAt.desc()).all()

    @staticmethod
    def get_by_id(db: Session, id_po: str):
        # Tìm chi tiết 1 đơn hàng theo ID
        return db.query(PurchaseOrder).\
            options(
                joinedload(PurchaseOrder.supplier),
                joinedload(PurchaseOrder.details).joinedload(PurchaseDetail.product),
                joinedload(PurchaseOrder.details).joinedload(PurchaseDetail.product_unit).joinedload(ProductUnit.unit_detail)
            ).\
            filter(PurchaseOrder.idPurchaseOrder == id_po).first()