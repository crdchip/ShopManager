import uuid

from sqlalchemy import Column, String, Numeric, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from core.database import Base

class Product(Base):
    __tablename__ = "Products"

    idProduct = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    sku = Column(String(50), unique=True, nullable=False, index=True)
    nameProduct = Column(String(255), nullable=False)
    idCategory = Column(String(36), ForeignKey("Categories.idCategory"), nullable=True)
    currentStock = Column(Numeric(10, 2), server_default="0.00")
    minStock = Column(Numeric(10, 2), server_default="0.00")
    basePrice = Column(Numeric(15, 2), nullable=False, server_default="0.00")
    purchasePrice = Column(Numeric(15, 2), nullable=False, server_default="0.00")
    description = Column(Text, nullable=True)
    imageProduct = Column(String(255), nullable=True)
    
    category = relationship("Category")
    product_units = relationship("ProductUnit", back_populates="product", cascade="all, delete-orphan")

class ProductUnit(Base):
    __tablename__ = "ProductUnits"

    idProductUnit = Column(String(36), primary_key=True, index=True)
    idProduct = Column(String(36), ForeignKey("Products.idProduct", ondelete="CASCADE"), nullable=False)
    idUnit = Column(String(36), ForeignKey("Units.idUnit"), nullable=False)
    unitSku = Column(String(50), unique=True, nullable=False, index=True)
    conversionFactor = Column(Numeric(10, 2), nullable=False, server_default="1.00")
    unitPrice = Column(Numeric(15, 2), nullable=False, server_default="0.00")
    purchasePrice = Column(Numeric(15, 2), nullable=False, server_default="0.00")
    isBaseUnit = Column(Boolean, default=False, nullable=False)

    product = relationship("Product", back_populates="product_units")
    
    # Đảm bảo chữ "Unit" khớp hoàn toàn với tên Class Model của bảng "Units" của bạn
    unit_detail = relationship("Units")