from sqlalchemy import Column, Integer, String, DateTime, text, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base


# 2. BẢNG USERS
class User(Base):
    __tablename__ = "Users"

    idUsers = Column(String(36), primary_key=True, index=True) 
    userName = Column(String(50), unique=True, nullable=False)
    passwordHash = Column(String(255), nullable=False)
    fullName = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    isActive = Column(Integer, server_default=text("'1'")) 
    createAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updateAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
    createdBy = Column(String(50), nullable=True)

    roles = relationship("Role", secondary="User_Roles", back_populates="users")
