import uuid
from sqlalchemy import Column, String, TIMESTAMP, text, Boolean
from core.database import Base

class Units(Base):
    __tablename__ = "Units"
    
    idUnit = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    unitName = Column(String(45), nullable=False)
    description = Column(String(255), nullable=True)
    isActive = Column(Boolean, default=True)
    
    createdAt = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP'))
    updatedAt = Column(TIMESTAMP, server_default=text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
    createdBy = Column(String(45), nullable=True)