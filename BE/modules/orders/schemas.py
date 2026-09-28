from decimal import Decimal
from sqlalchemy import Column, String, Integer, DECIMAL, DateTime, ForeignKey, text
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime , date

class ProductInDetail(BaseModel):
    idProduct: str
    nameProduct: str
    sku: Optional[str] = None

    class Config:
        from_attributes = True


class UnitDetailInUnit(BaseModel):
    idUnit: str
    unitName: str  # Lấy từ bảng Units thực tế của bạn

    class Config:
        from_attributes = True


class UnitInDetail(BaseModel):
    idProductUnit: str
    unitSku: Optional[str] = None
    conversionFactor: Optional[Decimal] = None
    # Lấy thông tin lồng từ mối quan hệ `unit_detail = relationship("Units")` ở Model
    unit_detail: Optional[UnitDetailInUnit] = None  

    class Config:
        from_attributes = True
        
class SupplierInOrder(BaseModel):
    idSuppliers: str
    nameSuppliers: str

    class Config:
        from_attributes = True

class PurchaseDetailCreate(BaseModel):
    idProduct: str
    idProductUnit: Optional[str] = None 
    nameProduct: Optional[str] = None
    quantity: float
    importPrice: float
    expiryDate: Optional[datetime] = None
    batchNumber: Optional[str] = None
    isUpdateBasePrice: bool = False

class PurchaseDetailResponse(BaseModel):
    idPurchaseDetail: str
    idProduct: str
    idProductUnit: Optional[str] = None
    quantity: Decimal
    importPrice: Decimal
    expiryDate: Optional[datetime] = None
    batchNumber: Optional[str] = None
    
    # --- THÊM 2 TRƯỜNG QUAN HỆ NÀY ---
    product: Optional[ProductInDetail] = None      # Khớp với relationship('Product') bên Model
    product_unit: Optional[UnitInDetail] = None   # Khớp với relationship('ProductUnit') bên Model

    class Config:
        from_attributes = True



class PurchaseOrderCreate(BaseModel):
    poNumber: str
    idSuppliers: Optional[str] = None
    note: Optional[str] = None
    createdBy: Optional[str] = None
    items: List[PurchaseDetailCreate]
    
    @field_validator('idSuppliers')
    def allow_empty_string_as_none(cls, v):
        if v == "" or v is None:
            return None
        return v

class PurchaseOrderResponse(BaseModel):
    idPurchaseOrder: str
    poNumber: str
    idSuppliers: str
    status: int
    totalCost: Decimal
    paymentStatus: int
    importDate: Optional[datetime] = None
    note: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    
    # --- THÊM 2 TRƯỜNG QUAN HỆ NÀY ---
    supplier: Optional[SupplierInOrder] = None     # Khớp với relationship('Supplier') bên Model
    details: List[PurchaseDetailResponse] = []     # Khớp với relationship('PurchaseDetail') bên Model

    class Config:
        from_attributes = True
        
class ProductInDetail(BaseModel):
    idProduct: str
    nameProduct: str
    sku: Optional[str] = None

    class Config:
        from_attributes = True
        
class UnitInDetail(BaseModel):
    idProductUnit: str
    unitName: Optional[str] = None
    conversionFactor: Optional[Decimal] = None

    class Config:
        from_attributes = True
        
class SupplierInOrder(BaseModel):
    idSuppliers: str
    nameSuppliers: str

    class Config:
        from_attributes = True