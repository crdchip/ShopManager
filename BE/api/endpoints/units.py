from  fastapi   import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional, List

from core.database import get_db
from modules.units.services import list_units_service, create_unit_service, delete_unit_service, update_unit_service
from modules.units.schemas import UnitCreate, UnitResponse, UnitUpdate
from core.responses import success_response, error_response
from core.schemas import APIResponse    

router = APIRouter()

@router.get("/")
def get_units(db: Session = Depends(get_db) ,idUnit: Optional[str] =   
    None):
        """
        **Lấy danh sách đơn vị:**
        - Nếu truyền `idUnit`: Trả về chi tiết 1 đơn vị.
        - Nếu không truyền: Trả về toàn bộ danh sách.
        """
    
        try:
            data = list_units_service(db, idUnit)
            
            isEmpty = (idUnit is not None and not data) or (idUnit is None and len(data) == 0)
            
            if isEmpty:
                return error_response(code=0, msg="Không tìm thấy đơn vị")
                
            return success_response(data=data,code=1, msg="Lấy đơn vị thành công")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))   
        
              
@router.post("/add", response_model=APIResponse[UnitResponse])
def add_unit(unit: UnitCreate, db: Session = Depends(get_db)):          
    try:
        db_unit = create_unit_service(db, unit)
        return success_response(data=db_unit, msg="Tạo đơn vị thành công")
    except HTTPException as e:
        return error_response(code=e.status_code, msg=str(e.detail))
    
@router.put("/update/{idUnit}", response_model=APIResponse[UnitResponse])
def update_unit(idUnit: str, unit_in: UnitUpdate, db: Session = Depends(get_db)):
    try:
        updated_unit = update_unit_service(db, idUnit, unit_in)
        return success_response(data=updated_unit, msg="Cập nhật đơn vị thành công")
    except HTTPException as e:
        return error_response(code=e.status_code, msg=str(e.detail))

                    
@router.delete("/delete/{idUnit}")
def delete_unit(idUnit: str, db: Session = Depends(get_db)):       
    
    """
    **Xóa đơn vị**:
    
    - Thay vì xóa hẳn, hệ thống sẽ đánh dấu `isActive = False` để giữ lại lịch sử.
    - Nếu đơn vị đang được sử dụng trong sản phẩm nào đó thì sẽ không cho xóa.
    """
    try:
        success = delete_unit_service(db, idUnit)
        if success:
            return success_response(msg="Đơn vị đã được xóa (isActive=False)")
        else:
            raise HTTPException(status_code=404, detail="Không tìm thấy đơn vị để xóa")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))