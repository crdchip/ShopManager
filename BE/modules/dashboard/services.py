from sqlalchemy.orm import Session
from modules.dashboard.repository import (
    get_total_revenue,
    get_total_sales_count,
    get_total_purchase_cost,
    get_total_products_count,
    get_top_selling_products,
    get_recent_sales
)

def get_dashboard_overview_service(db: Session):
    try:
        # Thu thập các số liệu thống kê tổng hợp
        total_revenue = get_total_revenue(db)
        total_sales_count = get_total_sales_count(db)
        total_purchase_cost = get_total_purchase_cost(db)
        total_products_count = get_total_products_count(db)
        
        # Thu thập danh sách chi tiết
        top_products = get_top_selling_products(db, limit=5)
        recent_sales = get_recent_sales(db, limit=5)
        
        return {
            "total_revenue": total_revenue,
            "total_sales_count": total_sales_count,
            "total_purchase_cost": total_purchase_cost,
            "total_products_count": total_products_count,
            "top_products": top_products,
            "recent_sales": recent_sales
        }
    except Exception as e:
        raise ValueError(f"Lỗi xử lý logic tầng dịch vụ Dashboard: {str(e)}")