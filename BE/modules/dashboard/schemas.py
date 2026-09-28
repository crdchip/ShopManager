from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TopProductResponse(BaseModel):
    idProduct: str
    sku: str
    nameProduct: str
    total_quantity: float
    total_revenue: float

    class Config:
        from_attributes = True

class RecentSaleResponse(BaseModel):
    idSale: str
    saleDate: datetime
    totalAmount: float
    idSeller: Optional[str] = None

    class Config:
        from_attributes = True

class DashboardSummaryResponse(BaseModel):
    total_revenue: float        # Tổng doanh thu bán hàng
    total_sales_count: int      # Tổng số đơn bán ra
    total_purchase_cost: float  # Tổng tiền chi nhập hàng
    total_products_count: int   # Tổng số mặt hàng trong kho
    top_products: List[TopProductResponse]
    recent_sales: List[RecentSaleResponse]