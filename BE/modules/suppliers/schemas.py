from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime

class SupplierBase(BaseModel):
    nameSuppliers:str = Field(..., example="Công ty TNHH ABC")
    phoneSuppliers: Optional[str] = Field(None, example="0901234567")
    addressSupplie: Optional[str] = Field(None, example="123 Đường ABC, Bình Dương")
    emailSupplier: Optional[EmailStr] = Field(None, example="contact@abc.com")
    taxCode: Optional[str] = Field(None, example="0101234567")
    contactPerson: Optional[str] = Field(None, example="Nguyễn Văn A")
    bankAccount: Optional[str] = Field(None, example="12345678910 - VCB")
    isActive: Optional[bool] = True

class SupplierCreate(SupplierBase):
    createdBy: Optional[str] = None

class SupplierUpdate(BaseModel):
    nameSuppliers: Optional[str] = None
    phoneSuppliers: Optional[str] = None
    addressSupplie: Optional[str] = None
    emailSupplier: Optional[EmailStr] = None
    taxCode: Optional[str] = None
    contactPerson: Optional[str] = None
    bankAccount: Optional[str] = None
    isActive: Optional[bool] = None
    
class SupplierSchema(BaseModel):
    idSuppliers: str
    nameSuppliers: str
    addressSupplie: str
    emailSupplier: str
    taxCode: str
    contactPerson: str
    bankAccount: str
    isActive: bool  
    createdAt: datetime

    class Config:
        from_attributes = True

class SupplierResponse(BaseModel):
    rCode: int
    rMsg: str
    rData: Optional[SupplierSchema] = None

    class Config:
        from_attributes = True
        
class SupplierListResponse(BaseModel):
    rCode: int
    rMsg: str
    rData: List[SupplierSchema]