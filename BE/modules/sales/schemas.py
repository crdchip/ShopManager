from decimal import Decimal
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- SUB-SCHEMAS ĐẦU RA BỔ TRỢ ---
class ProductInSaleDetail(BaseModel):
    idProduct: str
    nameProduct: str
    sku: Optional[str] = None

    class Config:
        from_attributes = True

class UnitInSaleDetail(BaseModel):
    idProductUnit: str
    unitSku: Optional[str] = None
    conversionFactor: Optional[Decimal] = None
    unitName: Optional[str] = None

    class Config:
        from_attributes = True

# --- SCHEMAS ĐẦU VÀO (DÙNG KHI SUBMIT ĐƠN BÁN) ---
class SaleDetailCreate(BaseModel):
    idProduct: str
    idProductUnit: Optional[str] = None
    nameProduct: Optional[str] = None  # Để hứng text hiển thị từ giỏ hàng FE
    quantity: float
    unitPrice: float

class SaleCreate(BaseModel):
    note: Optional[str] = None
    items: List[SaleDetailCreate]

# --- SCHEMAS ĐẦU RA (XUẤT RA API) ---
class SaleDetailResponse(BaseModel):
    idSaleDetail: str
    idSale: str
    idProduct: str
    idProductUnit: Optional[str] = None
    quantity: Decimal
    unitPrice: Decimal
    product: Optional[ProductInSaleDetail] = None
    product_unit: Optional[UnitInSaleDetail] = None

    class Config:
        from_attributes = True

class SaleResponse(BaseModel):
    idSale: str
    saleDate: datetime
    totalAmount: Decimal
    idSeller: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime
    details: List[SaleDetailResponse] = []

    class Config:
        from_attributes = True