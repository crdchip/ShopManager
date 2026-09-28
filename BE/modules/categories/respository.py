from sqlalchemy.orm import Session
from typing import Optional
from .models import Category
from .schemas import CategoryCreate

# 1. Lấy theo ID (UUID) hoặc lấy tất cả
def db_get_categories(db: Session, idCategory: Optional[str] = None):
    if idCategory is not None:
        # Lọc theo idCategory dạng String (UUID)
        return db.query(Category).filter(Category.idCategory == idCategory).first()
    return db.query(Category).all() 

# 2. Thêm mới danh mục
def db_insert_category(db: Session, category_in: CategoryCreate):       
    # Khởi tạo Object khớp với các trường trong ảnh Workbench
    parent_id = category_in.idParent if category_in.idParent != "" else None

    db_category = Category(
        nameCategory=category_in.nameCategory,
        description=category_in.description,
        idParent=parent_id, # Sử dụng biến đã xử lý
        createdBy=category_in.createdBy
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

# 3. Xóa danh mục 
def db_delete_category(db: Session, idCategory: str):
    db_category = db.query(Category).filter(Category.idCategory == idCategory).first()
    if db_category:
        # Thay vì xóa hẳn, ta chuyển isActive = False để giữ lịch sử
        db_category.isActive = not db_category.isActive 
        db.commit()
        return True
    return False

# 4. Cập nhật danh mục
def db_update_category(db: Session, idCategory: str, update_data: dict):
    db_category = db.query(Category).filter(Category.idCategory == idCategory).first()
    if not db_category:
        return None
    
    for key, value in update_data.items():
        if hasattr(db_category, key):
            setattr(db_category, key, value)
    
    db.commit()
    db.refresh(db_category)
    return db_category