import uuid
from sqlalchemy import Column, String, TIMESTAMP, text, ForeignKey, Boolean
from sqlalchemy.orm import relationship # Thêm cái này
from core.database import Base

class Category(Base):
    __tablename__ = "Categories"
    
    idCategory = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nameCategory = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    
    # Khóa ngoại tự tham chiếu
    idParent = Column(String(36), ForeignKey("Categories.idCategory"), nullable=True)
    
    # Audit fields
    isActive = Column(Boolean, default=True)
    createdAt = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    # Lưu ý: 'ON UPDATE' chỉ hoạt động trên một số DB như MySQL. 
    # Nếu dùng SQLite để test thì server_default chỉ nên để CURRENT_TIMESTAMP.
    updatedAt = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP')) 
    createdBy = Column(String(36), nullable=True)

    # Thêm dòng này để hỗ trợ truy vấn danh mục cha/con dễ dàng hơn
    parent = relationship("Category", remote_side=[idCategory], backref="children")