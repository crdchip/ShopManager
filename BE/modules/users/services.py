import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session

from .repository import db_get_users, db_insert_user, db_update_user, db_delete_user, db_login_user
from .models import User
from modules.roles.models import Role  
from .schemas import UserCreate, UserUpdate, UserLogin
from core.config import settings

def list_users_service(db: Session, idUser: Optional[str] = None):
    return db_get_users(db, idUser)

def create_user_service(db: Session, user_data: UserCreate):
    existing = db.query(User).filter(User.userName == user_data.userName).first()
    if existing:
        raise HTTPException(status_code=400, detail="Tên đăng nhập đã tồn tại trên hệ thống")
    
    # Tìm kiếm danh sách các đối tượng Role dựa trên mảng id truyền vào
    role_objects = []
    if user_data.roles:
        role_objects = db.query(Role).filter(Role.idRole.in_(user_data.roles)).all()
    
    # --- ĐỒNG BỘ BCRYPT NGUYÊN BẢN: Hash mật khẩu khi tạo user ---
    password_bytes = user_data.password.encode('utf-8')
    salt = bcrypt.gensalt(rounds=12)  # Tạo salt với số vòng lặp mặc định là 12 tương tự cấu hình cũ
    hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    return db_insert_user(db, user_data, hashed_password, role_objects)

def update_user_service(db: Session, idUser: str, user_in: UserUpdate):
    # Trích xuất dữ liệu, loại bỏ mục `roles` ra khỏi dict thông tin cơ bản để tránh lỗi map nhầm cột
    update_data = user_in.model_dump(exclude_unset=True)
    
    role_ids = update_data.pop("roles", None)
    role_objects = None
    
    # Nếu client có truyền mảng vai trò (kể cả mảng rỗng `[]`), tiến hành tìm thực thể mới
    if role_ids is not None:
        role_objects = db.query(Role).filter(Role.idRole.in_(role_ids)).all()
        
    # --- ĐỒNG BỘ BCRYPT NGUYÊN BẢN: Hash mật khẩu khi cập nhật user ---
    if "password" in update_data:
        raw_password = update_data.pop("password")
        password_bytes = raw_password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        update_data["passwordHash"] = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
    return db_update_user(db, idUser, update_data, role_objects)

def delete_user_service(db: Session, idUser: str):
    return db_delete_user(db, idUser)

def user_login_service(user_login: UserLogin, db: Session):
    username_str = user_login.userName
    plain_password = user_login.password

    # --- DEBUG 1: Kiểm tra dữ liệu từ Frontend gửi lên ---
    print("\n=== [DEBUG STEP 1] DỮ LIỆU ĐĂNG NHẬP TỪ FRONTEND ===")
    print(f"-> userName nhận được: '{username_str}'")
    print(f"-> password nhận được: '{plain_password}'")

    db_user = db_login_user(username_str, db)
    
    # --- DEBUG 2: Kiểm tra kết quả tìm kiếm trong Database ---
    print("\n=== [DEBUG STEP 2] KẾT QUẢ ĐỌC TỪ DATABASE ===")
    if not db_user:
        print(f"-> CẢNH BÁO: Không tìm thấy User nào có tên là '{username_str}' trong DB!")
        raise HTTPException(status_code=400, detail="Tài khoản hoặc mật khẩu không chính xác")
    else:
        print(f"-> Đã tìm thấy User trong DB!")
        print(f"-> idUsers thực tế: {db_user.idUsers}")
        print(f"-> userName thực tế: {db_user.userName}")
        print(f"-> passwordHash thực tế: {db_user.passwordHash}")
        print(f"-> Trạng thái isActive: {db_user.isActive} (Kiểu dữ liệu: {type(db_user.isActive)})")
    
    # --- DEBUG 3: Kiểm tra trạng thái hoạt động ---
    if not db_user.isActive:
        print("\n=== [DEBUG STEP 3] TRẠNG THÁI TÀI KHOẢN ===")
        print("-> CẢNH BÁO: Tài khoản này đang bị isActive = 0 hoặc False!")
        raise HTTPException(status_code=400, detail="Tài khoản đã bị khóa hoặc ngừng hoạt động")
        
    # --- DEBUG 4: Kiểm tra quá trình so khớp Bcrypt nguyên bản ---
    print("\n=== [DEBUG STEP 4] TIẾN HÀNH SO KHỚP BCRYPT NGUYÊN BẢN ===")
    try:
        # Làm sạch chuỗi hash từ DB phòng trường hợp thừa khoảng trắng (padding) do kiểu dữ liệu CHAR/VARCHAR
        clean_hash = db_user.passwordHash.strip() if db_user.passwordHash else ""
        
        # Ép dữ liệu chuỗi (String) thành chuỗi byte (Bytes) để thư viện gốc xử lý chính xác
        plain_bytes = plain_password.encode('utf-8')
        hash_bytes = clean_hash.encode('utf-8')
        
        # So khớp bằng hàm checkpw trực tiếp của thư viện bcrypt
        is_password_correct = bcrypt.checkpw(plain_bytes, hash_bytes)
        
        print(f"-> Kết quả hàm bcrypt.checkpw(): {is_password_correct}")
    except Exception as bcrypt_err:
        print(f"-> LỖI KHI CHẠY HÀM BCRYPT CHECKPW: {str(bcrypt_err)}")
        raise HTTPException(status_code=400, detail=f"Lỗi cấu trúc Bcrypt: {str(bcrypt_err)}")

    if not is_password_correct:
        print("-> CẢNH BÁO: Mật khẩu gõ vào KHÔNG KHỚP với chuỗi Hash trong DB!")
        raise HTTPException(status_code=400, detail="Tài khoản hoặc mật khẩu không chính xác")
        
    print("\n=== [DEBUG STEP 5] MẬT KHẨU ĐÚNG! TIẾN HÀNH TẠO TOKEN ===")
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES)    
    token_payload = {
        "sub": str(db_user.idUsers), 
        "exp": int(expire.timestamp()),
        "userName": str(db_user.userName)
    }
    
    encoded_jwt = jwt.encode(token_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    
    return {
        "accessToken": encoded_jwt,
        "tokenType": "bearer",
        "user": db_user
    }