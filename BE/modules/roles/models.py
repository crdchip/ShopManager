import uuid
from sqlalchemy.orm import relationship
from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, TIMESTAMP, text, Boolean
from core.database import Base

class UserRole(Base):
    __tablename__ = "User_Roles"

    idUsers = Column(String(36), ForeignKey("Users.idUsers", ondelete="CASCADE"), primary_key=True)
    idRole = Column(String(36), ForeignKey("Roles.idRole", ondelete="CASCADE"), primary_key=True)
    
    createdAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updatedAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
    createdBy = Column(String(50), nullable=True)


class Role(Base):
    __tablename__ = "Roles"

    idRole = Column(String(36), primary_key=True, index=True)
    roleName = Column(String(50), unique=True, nullable=False)
    roleShortName = Column(String(10), unique=True, nullable=True)
    description = Column(String(255), nullable=True)
    createdAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    updatedAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"))
    createdBy = Column(String(50), nullable=True)
    isActive = Column(Integer, server_default=text("'1'"))

    # 1. Quan hệ với bảng Users (secondary trỏ sang tên bảng trung gian dạng chuỗi)
    users = relationship("User", secondary="User_Roles", back_populates="roles")

    # 2. BỔ SUNG QUAN HỆ VỚI BẢNG PERMISSIONS
    permissions = relationship("Permission", secondary="Role_Permissions", back_populates="roles")
    
class RolePermission(Base):
    __tablename__ = "Role_Permissions"

    idRole = Column(String(36), ForeignKey("Roles.idRole", ondelete="CASCADE"), primary_key=True)
    idPermission = Column(String(36), ForeignKey("Permissions.idPermission", ondelete="CASCADE"), primary_key=True)
    
    createdAt = Column(DateTime, server_default=text("CURRENT_TIMESTAMP"))
    createdBy = Column(String(50), nullable=True)