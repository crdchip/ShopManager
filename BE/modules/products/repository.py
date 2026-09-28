import uuid
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from .models import Product, ProductUnit


# 1. Lấy danh sách sản phẩm
def db_get_products(db: Session, idProduct: Optional[str] = None):
    # Sử dụng joinedload để lôi hết mảng đơn vị quy đổi và chi tiết tên đơn vị kèm theo
    query = db.query(Product).options(
    joinedload(Product.product_units).joinedload(ProductUnit.unit_detail)
)
    
    if idProduct is not None:
        return query.filter(Product.idProduct == idProduct).first()
        
    return query.all()


# 3. Thêm mới sản phẩm kèm theo danh sách đơn vị quy đổi
def db_insert_product(db: Session, product_in: dict, units_data: list):
    product_data = product_in.copy()
    
    # Đảm bảo idProduct luôn được gán nếu chưa có
    if "idProduct" not in product_data or not product_data["idProduct"]:
        product_data["idProduct"] = str(uuid.uuid4())
    
    # Loại bỏ unitsData vì không tồn tại trong bảng Products
    product_data.pop("unitsData", None) 
    
    # Tạo object Product
    db_product = Product(**product_data)
    db.add(db_product)
    db.flush()
    
    # Lưu các đơn vị con (dùng danh sách units_data đã tách từ service)
    for u in units_data:
        # Nếu u là Pydantic model thì convert sang dict, nếu là dict thì giữ nguyên
        u_dict = u.model_dump() if hasattr(u, 'model_dump') else u
        
        db_p_unit = ProductUnit(
            idProductUnit=str(uuid.uuid4()),
            idProduct=db_product.idProduct,
            idUnit=u_dict.get("idUnit"),
            unitSku=u_dict.get("unitSku"),
            conversionFactor=u_dict.get("conversionFactor"),
            unitPrice=u_dict.get("unitPrice"),
            purchasePrice=u_dict.get("purchasePrice"),
            isBaseUnit=u_dict.get("isBaseUnit", False)
        )
        db.add(db_p_unit)
    db.commit()
    
    # Sử dụng Joinedload để lôi toàn bộ thông tin mới tạo kèm unitName ra luôn
    return db.query(Product).\
        options(joinedload(Product.product_units).joinedload(ProductUnit.unit_detail)).\
        filter(Product.idProduct == db_product.idProduct).\
        first()


def db_update_product(db: Session, idProduct: str, update_data: dict, units_data: Optional[list] = None):
    db_product = db.query(Product).filter(Product.idProduct == idProduct).first()
    if not db_product:
        return None
        
    # Update các thông tin cơ bản của bảng Products (Tên, danh mục, ảnh...)
    for key, value in update_data.items():
        if hasattr(db_product, key):
            setattr(db_product, key, value)
            
    # Xử lý cập nhật danh sách đơn vị quy đổi (Nếu FE có truyền mảng này lên)
    if units_data is not None:
        # Bước A: Xóa sạch các đơn vị cũ thuộc sản phẩm này
        db.query(ProductUnit).filter(ProductUnit.idProduct == idProduct).delete()
        
        # Bước B: Chèn lại danh sách đơn vị mới gửi lên
        for u in units_data:
            # Vì u là dict sau khi dump, ta dùng .get() cho an toàn
            db_p_unit = ProductUnit(
                idProductUnit=str(uuid.uuid4()),
                idProduct=idProduct,
                idUnit=u.get("idUnit"),
                unitSku=u.get("unitSku"),
                conversionFactor=u.get("conversionFactor"),
                
                # BẢO ĐẢM MAP ĐỦ CẢ GIÁ BÁN VÀ GIÁ NHẬP VÀO ĐÂY
                unitPrice=u.get("unitPrice", 0.0),
                purchasePrice=u.get("purchasePrice", 0.0), 
                
                isBaseUnit=u.get("isBaseUnit", False)
            )
            db.add(db_p_unit)

    db.commit()
    
    # Eager load lại data kèm unit_detail để Pydantic Response không bị thiếu unitName
    return db.query(Product).\
        options(joinedload(Product.product_units).joinedload(ProductUnit.unit_detail)).\
        filter(Product.idProduct == idProduct).\
        first()

# 5. Xóa sản phẩm
def db_delete_product(db: Session, idProduct: str):
    db_product = db.query(Product).filter(Product.idProduct == idProduct).first()
    if db_product:
        try:
            db.delete(db_product)  
            db.commit()           
            return True
        except Exception as e:
            db.rollback()          
            raise e
    return False