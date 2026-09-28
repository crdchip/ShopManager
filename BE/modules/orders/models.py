import uuid
from sqlalchemy import Column, String, Integer, DECIMAL, DateTime, ForeignKey, text
from sqlalchemy.orm import relationship
from core.database import Base 

class PurchaseOrder(Base):
    __tablename__ = "PurchaseOrders"

    idPurchaseOrder = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))    
    poNumber = Column(String(50), nullable=False, unique=True)
    idSuppliers = Column(String(36), ForeignKey("Suppliers.idSuppliers"), nullable=True)
    status = Column(Integer, default=1)
    totalCost = Column(DECIMAL(15, 2), default=0.00)
    paymentStatus = Column(Integer, default=1)
    importDate = Column(DateTime, nullable=True)
    note = Column(String(255), nullable=True)
    createdBy = Column(String(36), nullable=True)
    createdAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updatedAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))

    # Mối quan hệ nối sang bảng liên quan
    supplier = relationship("Supplier")
    details = relationship("PurchaseDetail", back_populates="order", cascade="all, delete-orphan")


class PurchaseDetail(Base):
    __tablename__ = "PurchaseDetails"

    idPurchaseDetail = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idPurchaseOrder = Column(String(36), ForeignKey("PurchaseOrders.idPurchaseOrder"), nullable=False)
    idProduct = Column(String(36), ForeignKey("Products.idProduct"), nullable=False) 
    
    # 🔥 SỬA TẠI ĐÂY: Xóa primary_key=True, thêm ForeignKey kết nối chuẩn sang bảng ProductUnits
    idProductUnit = Column(String(36), ForeignKey("ProductUnits.idProductUnit"), nullable=True)
    
    quantity = Column(DECIMAL(10, 2), nullable=False)
    receivedQuantity = Column(DECIMAL(10, 2), default=0.00)
    importPrice = Column(DECIMAL(15, 2), nullable=False)
    expiryDate = Column(DateTime, nullable=True)
    batchNumber = Column(String(50), nullable=True)

    # Các mối quan hệ liên kết dữ liệu xuôi dòng
    order = relationship("PurchaseOrder", back_populates="details")
    product = relationship("Product")
    
    # 🔥 SỬA TẠI ĐÂY: Đảm bảo class đích khớp chính xác với tên Model của bảng ProductUnits (thường là ProductUnit)
    product_unit = relationship("ProductUnit", foreign_keys=[idProductUnit])