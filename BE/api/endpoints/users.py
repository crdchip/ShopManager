from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, Any

from core.database import get_db

# Import các Schema chuẩn hóa dữ liệu đầu ra
from modules.users.schemas import UserCreate, UserResponse, UserUpdate, UserLogin
from modules.users.services import (
    list_users_service, 
    create_user_service, 
    update_user_service, 
    delete_user_service,
    user_login_service
)

router = APIRouter()

# 1. Lấy danh sách hoặc lấy chi tiết 1 user theo Query Parameter
@router.get("/", summary="Tải danh sách hoặc chi tiết người dùng")
def get_users(idUser: Optional[str] = None, db: Session = Depends(get_db)):
    try:
        result = list_users_service(db, idUser)
        
        if idUser and not result:
            return {
                "rCode": 0,
                "rMsg": "Người dùng không tồn tại hoặc đã bị xóa hẳn",
                "rData": None
            }
        
        if isinstance(result, list):
            serialized_data = [UserResponse.model_validate(item).model_dump() for item in result]
        elif result:
            serialized_data = UserResponse.model_validate(result).model_dump()
        else:
            serialized_data = []

        return {
            "rCode": 1,
            "rMsg": "Tải dữ liệu người dùng thành công",
            "rData": serialized_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi tải danh sách: {str(e)}")

    
# 2. Thêm mới người dùng tài khoản
@router.post("/", summary="Tạo mới tài khoản người dùng", status_code=status.HTTP_201_CREATED) 
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = create_user_service(db, user_in)
        
        # Ép kiểu dữ liệu SQL sang JSON dictionary sạch
        serialized_user = UserResponse.model_validate(db_user).model_dump()
        return {
            "rCode": 1,
            "rMsg": "Tạo tài khoản người dùng mới thành công",
            "rData": serialized_user
        }
    except HTTPException as e:
        return {
            "rCode": 0,
            "rMsg": str(e.detail),
            "rData": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi hệ thống: {str(e)}")


# 3. Cập nhật thông tin tài khoản
@router.put("/{idUser}", summary="Cập nhật thông tin người dùng")
def update_user(idUser: str, user_in: UserUpdate, db: Session = Depends(get_db)):
    try:
        updated_user = update_user_service(db, idUser, user_in)
        if not updated_user:
            return {
                "rCode": 0,
                "rMsg": "Cập nhật thất bại, không tìm thấy người dùng",
                "rData": None
            }
            
        # Ép kiểu dữ liệu SQL sang JSON dictionary sạch trước khi return
        serialized_user = UserResponse.model_validate(updated_user).model_dump()
        return {
            "rCode": 1,
            "rMsg": "Cập nhật dữ liệu người dùng thành công",
            "rData": serialized_user
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi cập nhật: {str(e)}")


# 4. Xóa người dùng (Xóa mềm - Toggle isActive)
@router.delete("/{idUser}", summary="Xóa mềm người dùng (Đổi trạng thái kích hoạt)")
def delete_user(idUser: str, db: Session = Depends(get_db)):
    try:
        success = delete_user_service(db, idUser)
        
        if not success:
            return {
                "rCode": 0,
                "rMsg": "Không tìm thấy người dùng để thực hiện thao tác",
                "rData": None
            }
        
        return {
            "rCode": 1,
            "rMsg": "Thay đổi trạng thái hoạt động của tài khoản thành công",
            "rData": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lỗi thao tác xóa: {str(e)}")
    
# @router.post("/login", summary="Đăng nhập hệ thống & Cấp mã ca trực POS")
# def login(user_login: UserLogin, db: Session = Depends(get_db)):
#     try:
#         auth_data = user_login_service(user_login, db)
        
#         # Đồng bộ hóa định dạng dữ liệu UserResponse lồng bên trong Token
#         # Đảm bảo UserResponse đã loại bỏ passwordHash trước khi dump
#         serialized_user = UserResponse.model_validate(auth_data["user"]).model_dump()
        
#         return {
#             "rCode": 1,
#             "rMsg": "Đăng nhập hệ thống thành công",
#             "rData": {
#                 "accessToken": auth_data["accessToken"],
#                 "tokenType": auth_data["tokenType"],
#                 "user": serialized_user 
#             }
#         }

#     except HTTPException as e:
#         return {
#             "rCode": 0,
#             "rMsg": e.detail,
#             "rData": None
#         }
        
#     except Exception as e:
#         return {
#             "rCode": 0,
#             "rMsg": f"Lỗi hệ thống: {str(e)}",
#             "rData": None
#         }
@router.post("/login", summary="Đăng nhập hệ thống & Cấp mã ca trực POS")
def login(user_login: UserLogin, db: Session = Depends(get_db)):
    
    try:
        auth_data = user_login_service(user_login, db)
        serialized_user = UserResponse.model_validate(auth_data["user"]).model_dump()
        
        return {
            "rCode": 1,
            "rMsg": "Đăng nhập hệ thống thành công",
            "rData": {
                "accessToken": auth_data["accessToken"],
                "tokenType": auth_data["tokenType"],
                "user": serialized_user 
            }
        }

    except HTTPException as e:
        # --- DEBUG KHI GẶP LỖI KIỂM SOÁT ĐƯỢC ---
        print(f"\n[ROUTE EXCEPT] Trả về lỗi rCode=0 từ HTTPException: {e.detail}")
        return {
            "rCode": 0,
            "rMsg": e.detail,
            "rData": None
        }
        
    except Exception as e:
        # --- DEBUG KHI GẶP LỖI HỆ THỐNG (BUG CODE) ---
        print(f"\n[ROUTE CRITICAL ERROR] Lỗi code hệ thống: {str(e)}")
        import traceback
        traceback.print_exc() # In chi tiết dòng code bị lỗi ra terminal
        return {
            "rCode": 0,
            "rMsg": f"Lỗi hệ thống: {str(e)}",
            "rData": None
        }