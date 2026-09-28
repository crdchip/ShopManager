from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Any

# Import core database
from core.database import get_db

# Import các tầng nghiệp vụ xử lý
from modules.permissions.schemas import PermissionCreate, PermissionUpdate, PermissionResponse
from modules.permissions.services import (
    list_permissions_service,
    create_permission_service,
    update_permission_service,
    delete_permission_service
)

router = APIRouter()

@router.get("/", summary="Lấy danh sách quyền hạn")
def get_permissions(idPermission: str = None, db: Session = Depends(get_db)):
    try:
        data = list_permissions_service(db, idPermission=idPermission)
        
        if idPermission and not data:
            return {"rCode": 0, "rMsg": "Không tìm thấy quyền hạn yêu cầu", "rData": None}
            
        # Ép kiểu dữ liệu danh sách qua Pydantic schema
        if isinstance(data, list):
            serialized_data = [PermissionResponse.model_validate(item).model_dump() for item in data]
        elif data:
            serialized_data = [PermissionResponse.model_validate(data).model_dump()]
        else:
            serialized_data = []

        return {
            "rCode": 1,
            "rMsg": "Tải danh sách quyền hạn thành công",
            "rData": serialized_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi hệ thống khi tải dữ liệu: {str(e)}"
        )


@router.post("/create", summary="Tạo mới một quyền hạn", status_code=status.HTTP_201_CREATED)
def create_permission(perm_in: PermissionCreate, db: Session = Depends(get_db)) -> Any:
    """
    Tạo mới một mã quyền hạn cho hệ thống.
    """
    try:
        # 1. Kiểm tra trùng lặp permKey trước khi insert
        existing_perms = list_permissions_service(db)
        if any(p.permKey == perm_in.permKey for p in existing_perms if hasattr(p, 'permKey')):
            return {
                "rCode": 0,
                "rMsg": f"Mã quyền (permKey) '{perm_in.permKey}' đã tồn tại trong hệ thống!",
                "rData": None
            }

        # 2. Gọi service ghi nhận dữ liệu xuống database
        new_perm = create_permission_service(db, perm_in)
        
        # 3. FIX LỖI: Ép kiểu đối tượng SQLAlchemy Model vừa tạo thành JSON Dictionary thuần túy
        serialized_data = PermissionResponse.model_validate(new_perm).model_dump()

        return {
            "rCode": 1,
            "rMsg": "Thêm mới quyền hạn thành công",
            "rData": serialized_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi hệ thống khi tạo mới: {str(e)}"
        )


@router.put("/update/{idPermission}", summary="Cập nhật thông tin quyền hạn")
def update_permission(idPermission: str, perm_in: PermissionUpdate, db: Session = Depends(get_db)) -> Any:
    """
    Chỉnh sửa thông tin quyền hạn dựa trên ID.
    Hỗ trợ partial update (chỉ truyền trường nào cần sửa trường đó).
    """
    try:
        updated_perm = update_permission_service(db, idPermission, perm_in)
        if not updated_perm:
            return {
                "rCode": 0,
                "rMsg": f"Không tìm thấy dữ liệu quyền hạn với ID: {idPermission} để cập nhật",
                "rData": None
            }
            
        # 4. FIX LỖI: Tương tự POST, ta ép kiểu đối tượng sau khi sửa thành JSON Dictionary
        serialized_data = PermissionResponse.model_validate(updated_perm).model_dump()

        return {
            "rCode": 1,
            "rMsg": "Cập nhật dữ liệu quyền hạn thành công",
            "rData": serialized_data
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi hệ thống khi cập nhật: {str(e)}"
        )


@router.delete("/delete/{idPermission}", summary="Xóa bỏ quyền hạn khỏi hệ thống")
def delete_permission(idPermission: str, db: Session = Depends(get_db)) -> Any:
    """
    Xóa hẳn dữ liệu cấu hình mã quyền hạn này ra khỏi cơ sở dữ liệu.
    """
    try:
        success = delete_permission_service(db, idPermission)
        if not success:
            return {
                "rCode": 0,
                "rMsg": f"Xóa thất bại. Không tìm thấy mã quyền hạn mang ID: {idPermission}",
                "rData": False
            }
            
        return {
            "rCode": 1,
            "rMsg": "Đã xóa quyền hạn ra khỏi hệ thống thành công",
            "rData": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi hệ thống khi thực hiện xóa: {str(e)}"
        )