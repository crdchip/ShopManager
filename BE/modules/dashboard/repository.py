from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from modules.products.models import Product
from modules.sales.models import Sale, SaleDetail
from modules.orders.models import PurchaseOrder

def get_total_revenue(db: Session) -> float:
    """Tính tổng doanh thu từ tất cả các đơn bán hàng"""
    result = db.query(func.sum(Sale.totalAmount)).scalar()
    return float(result) if result else 0.0

def get_total_sales_count(db: Session) -> int:
    """Đếm tổng số hóa đơn bán hàng"""
    return db.query(func.count(Sale.idSale)).scalar() or 0

def get_total_purchase_cost(db: Session) -> float:
    """Tính tổng số tiền đã chi ra để nhập hàng (PurchaseOrders)"""
    result = db.query(func.sum(PurchaseOrder.totalCost)).scalar()
    return float(result) if result else 0.0

def get_total_products_count(db: Session) -> int:
    """Đếm tổng số lượng đầu mã sản phẩm đang có trong hệ thống"""
    return db.query(func.count(Product.idProduct)).scalar() or 0

def get_top_selling_products(db: Session, limit: int = 5):
    """Lấy danh sách top sản phẩm bán chạy nhất dựa trên bảng SaleDetails"""
    query = db.query(
        Product.idProduct,
        Product.sku,
        Product.nameProduct,
        func.sum(SaleDetail.quantity).label('total_quantity'),
        func.sum(SaleDetail.quantity * SaleDetail.unitPrice).label('total_revenue')
    ).join(SaleDetail, Product.idProduct == SaleDetail.idProduct)\
     .group_by(Product.idProduct, Product.sku, Product.nameProduct)\
     .order_by(desc('total_quantity'))\
     .limit(limit)\
     .all()
    
    return [
        {
            "idProduct": row[0],
            "sku": row[1],
            "nameProduct": row[2],
            "total_quantity": float(row[3] or 0.0),
            "total_revenue": float(row[4] or 0.0)
        } for row in query
    ]

def get_recent_sales(db: Session, limit: int = 5):
    """Lấy danh sách các hóa đơn bán hàng gần đây nhất"""
    return db.query(Sale).order_by(desc(Sale.saleDate)).limit(limit).all()