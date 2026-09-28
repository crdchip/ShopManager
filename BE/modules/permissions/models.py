import uuid
from sqlalchemy import Column, ForeignKey, String, DateTime, text
from sqlalchemy.orm import relationship

from core.database import Base

class Permission(Base):
    __tablename__ = "Permissions"

    idPermission = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    permKey = Column(String(100), unique=True, nullable=False)   # Khớp VARCHAR(100)
    permName = Column(String(255), nullable=False)              # Khớp VARCHAR(255)
    module = Column(String(50), nullable=False)                 # Khớp VARCHAR(50)
    
    # Tự động hóa ở tầng Database với server_default
    createdAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updatedAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
    createdBy = Column(String(50), nullable=True)
    roles = relationship("Role", secondary="Role_Permissions", back_populates="permissions")
    
