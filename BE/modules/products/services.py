import time
import random
from typing import Optional
from sqlalchemy.orm import Session
from modules.products.repository import db_get_products, db_insert_product, db_delete_product, db_update_product
from modules.products.schemas import ProductCreate, ProductUpdate
from modules.products.models import Product


def list_products_service(db: Session, idProduct: Optional[str] = None):
    result = db_get_products(db, idProduct)
    if idProduct is not None and not result:
        return None # Trả về None để Router dễ xử lý lỗi
    return result


def create_product_service(db, product):
    product_dict = product.dict()
    units_data = product_dict.pop("unitsData", [])
    
    
    
    if not units_data:
        default_unit_info = {
            "idUnit": product_dict.get("idUnit") or product_dict.get("unit"),
            "conversionFactor": 1.0,
            "unitSku": product_dict.get("sku"),
            "unitPrice": product_dict.get("basePrice", 0.0), 
            "purchasePrice": product_dict.get("purchasePrice", 0.0), 
            "isBaseUnit": True
        }
        units_data = [default_unit_info]
    if not product_dict.get("sku") or product_dict.get("sku") == "AUTO_SKU":
    # Tạo mã theo kiểu: SP + timestamp + số ngẫu nhiên
        product_dict["sku"] = f"SP{int(time.time())}{random.randint(1000, 9999)}"
        
    product_dict.pop("unit", None)
    return db_insert_product(db, product_dict, units_data)

def update_product_service(db: Session, idProduct: str, product_in: ProductUpdate):
    # Sử dụng exclude_unset=True để chỉ lấy các trường FE thực sự truyền lên
    update_data = product_in.model_dump(exclude_unset=True)
    
    # 1. TÁCH MẢNG UNITS DATA RA RIÊNG (Nếu FE không truyền thì mặc định là None)
    units_data = update_data.pop("unitsData", None)
    
    if "sku" in update_data:
        existing = db.query(Product).filter(
            Product.sku == update_data["sku"], 
            Product.idProduct != idProduct
        ).first()
        if existing:
            raise ValueError(f"Mã SKU '{update_data['sku']}' đã tồn tại")

    # 2. TRUYỀN CẢ HAI VÀO HÀM UPDATE
    updated_product = db_update_product(db, idProduct, update_data, units_data)
    if not updated_product:
        raise ValueError("Sản phẩm không tồn tại")
        
    return updated_product


def delete_product_service(db: Session, idProduct: str):
    
    success = db_delete_product(db, idProduct)
    if not success:
        raise ValueError(f"Không tìm thấy sản phẩm có ID {idProduct} để xóa")
    
    return success