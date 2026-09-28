from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List, Union
from core.database import get_db
from modules.categories.services import list_categories_service, create_category_service, delete_category_service, update_category_service
from modules.categories.schemas import CategoryCreate, CategoryResponse, CategoryUpdate
from core.responses import success_response, error_response
from core.schemas import APIResponse

# Khởi tạo router
router = APIRouter()

@router.get("/", response_model=APIResponse[Union[CategoryResponse, List[CategoryResponse], None]])
def get_categories(db: Session = Depends(get_db) ,idCategory: Optional[int] = None):
    """
    **Lấy danh sách danh mục:**
    - Nếu truyền `idCategory`: Trả về chi tiết 1 danh mục.
    - Nếu không truyền: Trả về toàn bộ danh sách.
    """
 
    try:
        data = list_categories_service(db, idCategory)
        
        isEmpty = (idCategory is not None and not data) or (idCategory is None and len(data) == 0)
        
        if isEmpty:
            return success_response(data=[], msg="Không tìm thấy danh mục")
            
        return success_response(data=data, msg="Lấy danh mục thành công")
    # except Exception as e:
    #     return error_response(code=500, error=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/add") 
def add_category(category: CategoryCreate, db: Session = Depends(get_db)):
    try:
        db_category = create_category_service(db, category)
        return success_response(data=db_category, msg="Tạo danh mục thành công")
    except HTTPException as e:
        # Nếu là lỗi logic đã bắt được (trùng tên, cha không tồn tại)
        return error_response(code=e.status_code, msg=e.detail)
    except Exception as e:
        # Lỗi hệ thống chưa lường trước
        return error_response(code=500, msg=str(e))

@router.put("/update/{idCategory}", response_model=APIResponse[CategoryResponse])
def update_category(
    idCategory: str, 
    category_in: CategoryUpdate, 
    db: Session = Depends(get_db)
):
    """
    **Cập nhật thông tin danh mục**:
    
    - Cho phép cập nhật tên và mô tả.
    - Kiểm tra trùng tên nếu có thay đổi.
    """
    try:
        updated_category = update_category_service(db, idCategory, category_in)
        return success_response(data=updated_category, msg="Cập nhật danh mục thành công")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/delete/{idCategory}", response_model=APIResponse[bool])
def delete_category(idCategory: str, db: Session = Depends(get_db)):    
    """
    **Xóa danh mục**:
    
    - Kiểm tra xem danh mục có tồn tại không trước khi xóa.
    - Nếu danh mục đang chứa sản phẩm, có thể thêm logic để ngăn không cho xóa (nếu cần).
    """
    try:
        success = delete_category_service(db, idCategory)
        if success:
            return success_response(data=True, msg="Xóa danh mục thành công")
        else:
            return success_response(data=False, msg="Không tìm thấy danh mục để xóa")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))