from fastapi import HTTPException
from typing import Optional
from sqlalchemy.orm import Session
# Đảm bảo KHÔNG CÓ db_get_all_categories ở đây
from .respository import db_get_categories, db_insert_category, db_delete_category, db_update_category
from .schemas import CategoryCreate, CategoryUpdate
from .models import Category


def list_categories_service(db: Session, idCategory: Optional[str] = None):
    result = db_get_categories(db, idCategory)
    if idCategory is not None and not result:
        return None 
    return result

def create_category_service(db: Session, category_data: CategoryCreate):
    # 1. Kiểm tra tên danh mục đã tồn tại chưa (trong cùng một cấp hoặc toàn bộ)
    existing_category = db.query(Category).filter(
        Category.nameCategory == category_data.nameCategory
    ).first()
    
    if existing_category:
        raise HTTPException(status_code=400, detail=f"Tên danh mục '{category_data.nameCategory}' đã tồn tại")  

    # 2. Kiểm tra tính hợp lệ của idParent (nếu có truyền lên)
    if category_data.idParent:
        parent_exists = db.query(Category).filter(
            Category.idCategory == category_data.idParent,
            Category.isActive == True
        ).first()
        if not parent_exists:
            raise HTTPException(status_code=400, detail="Danh mục cha không tồn tại hoặc đã bị vô hiệu hóa.")

    # 3. Tiến hành gọi hàm insert ở tầng repository
    try:
        return db_insert_category(db, category_data)
    except Exception as e:
        # Bắt lỗi database (ví dụ: lỗi khóa ngoại hoặc UUID)
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi khi tạo danh mục: {str(e)}")

def update_category_service(db: Session, idCategory: str, category_in: CategoryUpdate):
    # Loại bỏ các trường không được truyền lên
    update_data = category_in.model_dump(exclude_unset=True)
    
    # Kiểm tra trùng tên (Trừ bản ghi hiện tại)
    if "nameCategory" in update_data:
        existing = db.query(Category).filter(
            Category.nameCategory == update_data["nameCategory"], 
            Category.idCategory != idCategory
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Tên danh mục '{update_data['nameCategory']}' đã tồn tại")

    updated = db_update_category(db, idCategory, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Danh mục không tồn tại")
    return updated

def delete_category_service(db: Session, idCategory: str):
    # Kiểm tra ràng buộc: Nếu có danh mục con thì không cho xóa/khóa
    has_children = db.query(Category).filter(Category.idParent == idCategory, Category.isActive == True).first()
    if has_children:
        raise HTTPException(status_code=400, detail="Không thể xóa danh mục này vì đang có các danh mục con bên trong")

    success = db_delete_category(db, idCategory)
    if not success:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy danh mục để xóa")
    return success