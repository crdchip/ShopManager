import uuid
from sqlalchemy import Column, String, TIMESTAMP, text, Boolean
from core.database import Base

class Supplier(Base):
    __tablename__ = "Suppliers"
    
    # Khớp với cột idSuppliers (CHAR 36)
    idSuppliers = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nameSuppliers = Column(String(255), nullable=False)
    phoneSuppliers = Column(String(20), nullable=True)
    addressSupplie = Column(String(255), nullable=True) # Theo độ dài hiển thị trong ảnh
    emailSupplier = Column(String(100), nullable=True)
    taxCode = Column(String(20), nullable=True)
    contactPerson = Column(String(100), nullable=True)
    bankAccount = Column(String(50), nullable=True)
    isActive = Column(Boolean, default=True)
    
    # Các trường Timestamp và Audit
    createdAt = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    updatedAt = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
    createdBy = Column(String(36), nullable=True)