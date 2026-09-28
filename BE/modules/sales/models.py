import uuid
from sqlalchemy import Column, String, DECIMAL, DateTime, ForeignKey, text, Integer
from sqlalchemy.orm import relationship
from core.database import Base 

class Sale(Base):
    __tablename__ = "Sales"

    idSale = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    saleDate = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    totalAmount = Column(DECIMAL(15, 2), default=0.00)
    idSeller = Column(String(36), nullable=True)
    
    # Quản lý thời gian hệ thống phục vụ chỉnh sửa, kiểm toán
    createdAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updatedAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))

    # Mối quan hệ một - nhiều xuống bảng chi tiết
    details = relationship("SaleDetail", back_populates="sale", cascade="all, delete-orphan")


class SaleDetail(Base):
    __tablename__ = "SaleDetails"

    idSaleDetail = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idSale = Column(String(36), ForeignKey("Sales.idSale"), nullable=False)
    idProduct = Column(String(36), ForeignKey("Products.idProduct"), nullable=False) 
    idProductUnit = Column(String(36), ForeignKey("ProductUnits.idProductUnit"), nullable=True)
    quantity = Column(DECIMAL(10, 2), nullable=False)
    unitPrice = Column(DECIMAL(15, 2), nullable=False)

    # Khớp nối ngược dòng dữ liệu
    sale = relationship("Sale", back_populates="details")
    product = relationship("Product")
    product_unit = relationship("ProductUnit", foreign_keys=[idProductUnit])