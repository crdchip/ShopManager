from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from core.database import get_db
from modules.roles.schemas import RoleCreate, RoleUpdate, RoleResponse, AssignRolesInput
from modules.roles.services import (
    list_roles_service,
    create_role_service,
    update_role_service,
    get_user_roles_service,
    assign_user_roles_service,
    delete_role_service
)

router = APIRouter()

# ==========================================
# 1. CÁC API QUẢN LÝ CẤU HÌNH DANH MỤC ROLES & PERMISSIONS
# ==========================================

@router.get("/", summary="Lấy danh sách hoặc chi tiết chức vụ (Role)")
def get_roles(idRole: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        data = list_roles_service(db, idRole=idRole)
        if idRole and not data:
            return {"rCode": 0, "rMsg": "Không tìm thấy chức vụ yêu cầu", "rData": None}
            
        if isinstance(data, list):
            serialized = [RoleResponse.model_validate(item).model_dump() for item in data]
        elif data:
            serialized = RoleResponse.model_validate(data).model_dump()
        else:
            serialized = []

        return {"rCode": 1, "rMsg": "Thành công", "rData": serialized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create", summary="Tạo mới một chức vụ kèm phân quyền", status_code=status.HTTP_201_CREATED)
def create_role(role_in: RoleCreate, db: Session = Depends(get_db)):
    try:
        new_role = create_role_service(db, role_in)
        serialized = RoleResponse.model_validate(new_role).model_dump()
        return {"rCode": 1, "rMsg": "Tạo nhóm quyền và gán quyền thành công", "rData": serialized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{idRole}", summary="Cập nhật chức vụ và phân lại quyền hạn chi tiết")
def update_role(idRole: str, role_in: RoleUpdate, db: Session = Depends(get_db)):
    try:
        updated_role = update_role_service(db, idRole, role_in)
        if not updated_role:
            return {"rCode": 0, "rMsg": "Không tìm thấy vai trò hệ thống yêu cầu", "rData": None}
            
        serialized = RoleResponse.model_validate(updated_role).model_dump()
        return {"rCode": 1, "rMsg": "Cập nhật vai trò và cấu hình quyền thành công", "rData": serialized}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.delete("/{idRole}", summary="Xóa bỏ một chức vụ khỏi hệ thống")
def delete_role(idRole: str, db: Session = Depends(get_db)):
    try:
        # Gọi xuống dịch vụ xử lý xóa
        deleted_id = delete_role_service(db, idRole)
        
        return {
            "rCode": 1,
            "rMsg": "Xóa chức vụ khỏi hệ thống thành công",
            "rData": {"idRole": deleted_id}
        }
    except HTTPException as http_ex:
        # Giữ lại các lỗi validation/nghiệp vụ chủ động (400, 404)
        return {"rCode": 0, "rMsg": http_ex.detail, "rData": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống khi xóa role: {str(e)}")


# ==========================================
# 2. CÁC API KIỂM SOÁT ROLE CHO TỪNG USER
# ==========================================

@router.get("/user/{idUsers}", summary="Xem danh sách các Role của một User cụ thể")
def get_roles_of_user(idUsers: str, db: Session = Depends(get_db)):
    try:
        user_roles = get_user_roles_service(db, idUsers)
        serialized = [RoleResponse.model_validate(item).model_dump() for item in user_roles]
        
        return {
            "rCode": 1,
            "rMsg": f"Tải danh sách chức vụ của user {idUsers} thành công",
            "rData": serialized
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/user/{idUsers}/assign", summary="Cập nhật / Gán danh sách Role cho User")
def assign_roles_to_user(idUsers: str, input_data: AssignRolesInput, db: Session = Depends(get_db)):
    """
    Truyền vào danh sách idRole mới để đồng bộ lại toàn bộ chức vụ của User.
    Nếu truyền mảng trống [] -> Đồng nghĩa gỡ bỏ sạch toàn bộ Role của User đó.
    """
    try:
        success = assign_user_roles_service(
            db, 
            idUsers=idUsers, 
            id_role_list=input_data.idRoleList, 
            creator=input_data.createdBy
        )
        
        return {
            "rCode": 1,
            "rMsg": "Cập nhật và phân vai trò người dùng thành công!",
            "rData": success
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi xử lý phân quyền người dùng: {str(e)}")