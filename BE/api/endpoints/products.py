import io
import httpx
import openpyxl
import pandas as pd
from fastapi import APIRouter, File, HTTPException, Depends, UploadFile
from sqlalchemy.orm import Session
from typing import Optional
from fastapi.responses import StreamingResponse
from core.database import get_db
from modules.categories.models import Category
from modules.products.models import Product, ProductUnit
from modules.products.repository import db_insert_product
from modules.products.services import list_products_service, create_product_service, delete_product_service, update_product_service
from modules.products.schemas import ProductCreate, ProductResponse, ProductUpdate
from core.responses import success_response, error_response
from core.schemas import APIResponse

from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# Khởi tạo router
router = APIRouter()

@router.get("/")
def get_products(db: Session = Depends(get_db) ,idProduct: Optional[str] = None):
    try:
        data = list_products_service(db, idProduct)
        isEmpty = (idProduct is not None and not data) or (idProduct is None and len(data) == 0)
        if isEmpty:
            return success_response(data=[], msg="Không tìm thấy sản phẩm")
        return success_response(data=data, msg="Lấy sản phẩm thành công")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/add", response_model=APIResponse[ProductResponse])
def add_product(product: ProductCreate, db: Session = Depends(get_db)):
    try:
        data = create_product_service(db, product)
        return success_response(
            data=ProductResponse.model_validate(data), 
            msg="Thêm sản phẩm thành công"
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/update/{idProduct}", response_model=APIResponse[ProductResponse])
def update_product(idProduct: str, product_in: ProductUpdate, db: Session = Depends(get_db)):
    try:
        data = update_product_service(db, idProduct, product_in)
        return success_response(
            data=ProductResponse.model_validate(data), 
            msg="Cập nhật thành công"
        )
    except ValueError as e:
        return error_response(code=400, msg=str(e))
    
@router.delete("/delete/{idProduct}", response_model=APIResponse)
def delete_product(idProduct: str, db: Session = Depends(get_db)):
    try:
        delete_product_service(db, idProduct)
        return success_response(msg=f"Đã xóa sản phẩm thành công")
    except ValueError as e:
        return error_response(code=404, msg=str(e), error="Not Found")
    except Exception as e:
        return error_response(code=500, msg="Lỗi hệ thống khi xóa", error=str(e))


def clean_str_id(val):
    """Hàm chuẩn hóa chuỗi khóa ngoại tránh lỗi số thực (.0) của Pandas"""
    if pd.isna(val) or str(val).strip().lower() in ["nan", "null", ""]:
        return None
    val_str = str(val).strip()
    if val_str.endswith('.0') and val_str[:-2].isdigit():
        return val_str[:-2]
    return val_str


@router.post("/import-excel")
async def import_products_from_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        file_bytes = await file.read()
        
        try:
            df = pd.read_excel(io.BytesIO(file_bytes), sheet_name="Template Import")
        except Exception:
            df = pd.read_excel(io.BytesIO(file_bytes), sheet_name=0)
        
        if df.empty:
            return {"rCode": 0, "rMsg": "Tệp Excel không có dữ liệu để xử lý.", "rData": None}

        df.columns = df.columns.str.strip()

        # ĐỒNG BỘ TIÊU ĐỀ CỘT TỰ ĐỘNG (Đã bỏ map Nhà Cung Cấp)
        rename_mapping = {}
        for col in df.columns:
            col_upper = col.upper()
            if "MÃ SẢN PHẨM" in col_upper or "SKU SẢN PHẨM" in col_upper or "PRODUCT_SKU" in col_upper:
                rename_mapping[col] = "Mã Sản Phẩm (SKU)"
            elif "TÊN SẢN PHẨM" in col_upper or "PRODUCT_NAME" in col_upper:
                rename_mapping[col] = "Tên Sản Phẩm"
            elif "DANH MỤC" in col_upper or "CATEGORY" in col_upper:
                rename_mapping[col] = "ID Danh Mục"
            elif "TỒN KHO" in col_upper or "STOCK" in col_upper:
                rename_mapping[col] = "Tồn kho hiện tại"
            elif "CẢNH BÁO" in col_upper or "MIN" in col_upper:
                rename_mapping[col] = "Cảnh báo Min"
            elif "MÔ TẢ" in col_upper or "DESCRIPTION" in col_upper:
                rename_mapping[col] = "Mô tả"
            elif "ĐƠN VỊ GỐC" in col_upper or "ĐƠN VỊ (ID)" in col_upper or "IDUNIT" in col_upper:
                rename_mapping[col] = "Mã Đơn Vị Gốc (idUnit)"
            elif "SKU ĐƠN VỊ" in col_upper or "UNIT_SKU" in col_upper:
                rename_mapping[col] = "Mã SKU Đơn Vị"
            elif "QUY ĐỔI" in col_upper or "CONVERSION" in col_upper:
                rename_mapping[col] = "Hệ Số Quy Đổi"
            elif "GIÁ NHẬP" in col_upper or "PURCHASE" in col_upper:
                rename_mapping[col] = "Giá Nhập"
            elif "GIÁ BÁN" in col_upper or "PRICE" in col_upper:
                rename_mapping[col] = "Giá Bán"
            elif "CƠ SỞ" in col_upper or "BASE" in col_upper:
                rename_mapping[col] = "Đơn Vị Cơ Sở? (X)"

        df = df.rename(columns=rename_mapping)

        if "Mã Sản Phẩm (SKU)" not in df.columns or "Tên Sản Phẩm" not in df.columns:
            return {
                "rCode": 0, 
                "rMsg": "Hệ thống không tìm thấy cột 'Mã Sản Phẩm (SKU)' hoặc 'Tên Sản Phẩm'.", 
                "rData": None
            }

        df = df[df["Mã Sản Phẩm (SKU)"].notna() | df.get("Mã SKU Đơn Vị", pd.Series(dtype=str)).notna()]
        if df.empty:
            return {"rCode": 0, "rMsg": "Tệp Excel không chứa dữ liệu hợp lệ.", "rData": None}

        # Làm đầy dữ liệu gộp ô (Đã bỏ dòng Ffill của ID Nhà Cung Cấp)
        if "Mã Sản Phẩm (SKU)" in df.columns: df['Mã Sản Phẩm (SKU)'] = df['Mã Sản Phẩm (SKU)'].ffill().astype(str).str.strip()
        if "Tên Sản Phẩm" in df.columns: df['Tên Sản Phẩm'] = df['Tên Sản Phẩm'].ffill().astype(str).str.strip()
        if 'ID Danh Mục' in df.columns: df['ID Danh Mục'] = df['ID Danh Mục'].ffill()
        if 'Tồn kho hiện tại' in df.columns: df['Tồn kho hiện tại'] = df['Tồn kho hiện tại'].ffill().fillna(0)
        if 'Cảnh báo Min' in df.columns: df['Cảnh báo Min'] = df['Cảnh báo Min'].ffill().fillna(0)
        if 'Mô tả' in df.columns: df['Mô tả'] = df['Mô tả'].ffill().fillna("")

        products_dict = {}
        
        for _, row in df.iterrows():
            sp_sku = str(row.get('Mã Sản Phẩm (SKU)', '')).strip()
            if sp_sku == "" or sp_sku.lower() in ["nan", "null"]:
                continue
                
            if sp_sku not in products_dict:
                products_dict[sp_sku] = {
                    "sku": sp_sku,
                    "nameProduct": str(row.get('Tên Sản Phẩm', '')).strip(),
                    "idCategory": clean_str_id(row.get('ID Danh Mục')),
                    "description": str(row.get('Mô tả', '')).strip(),
                    "currentStock": float(row.get('Tồn kho hiện tại', 0)),
                    "minStock": float(row.get('Cảnh báo Min', 0)),
                    "basePrice": 0.0,      
                    "purchasePrice": 0.0,  
                    "unitsData": [] # Sẽ chứa danh sách các quy đổi quy cách
                }
                
            raw_base_value = row.get('Đơn Vị Cơ Sở? (X)') or row.get('Đơn Vị Cơ Sở?') or ''
            is_base = str(raw_base_value).strip().upper() in ['X', '1', 'TRUE', 'YES']
            unit_id_val = clean_str_id(row.get('Mã Đơn Vị Gốc (idUnit)'))
                        
            unit_info = {
                "idUnit": unit_id_val,
                "unitSku": str(row.get('Mã SKU Đơn Vị', '')).strip() if pd.notna(row.get('Mã SKU Đơn Vị')) else "",
                "conversionFactor": float(row.get('Hệ Số Quy Đổi', 1.0)) if pd.notna(row.get('Hệ Số Quy Đổi')) else 1.0,
                "purchasePrice": float(row.get('Giá Nhập', 0.0)) if pd.notna(row.get('Giá Nhập')) else 0.0,
                "unitPrice": float(row.get('Giá Bán', 0.0)) if pd.notna(row.get('Giá Bán')) else 0.0,
                "isBaseUnit": is_base
            }
            
            if is_base:
                products_dict[sp_sku]["basePrice"] = unit_info["unitPrice"]
                products_dict[sp_sku]["purchasePrice"] = unit_info["purchasePrice"]
                
            products_dict[sp_sku]["unitsData"].append(unit_info)

        success_count = 0
        errors = []
        
        for sp_sku, product_data in products_dict.items():
            try:
                if product_data["basePrice"] == 0.0 and product_data["unitsData"]:
                    product_data["basePrice"] = product_data["unitsData"][0]["unitPrice"]
                    product_data["purchasePrice"] = product_data["unitsData"][0]["purchasePrice"]

                units_data = product_data.get("unitsData", [])
                db_insert_product(db, product_data, units_data)
                success_count += 1
            except Exception as e:
                err_msg = str(e.__dict__.get('orig', e)) if hasattr(e, '__dict__') else str(e)
                errors.append(f"Mã {sp_sku}: {err_msg}")
                
        return {
            "rCode": 1 if success_count > 0 else 0,
            "rMsg": f"Import hoàn tất. Thành công: {success_count}, Thất bại: {len(errors)}.",
            "rData": {"success_count": success_count, "errors": errors}
        }
    except Exception as e:
        return {"rCode": 0, "rMsg": f"Lỗi xử lý hệ thống: {str(e)}", "rData": None}
    
    
async def fetch_bachhoaxanh_barcode(barcode: str) -> dict:
    url = f"https://www.bachhoaxanh.com/aj/product/search?keyword={barcode}"
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    }
    async with httpx.AsyncClient(timeout=3.0) as client:
        try:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                if data.get("products"):
                    p = data["products"][0]
                    return {
                        "name": p.get("product_name", ""),
                        "image": p.get("image_url", ""),
                        "description": f"Sản phẩm đồng bộ tự động từ mã vạch {barcode}"
                    }
        except Exception:
            pass
    return None

@router.get("/scan/{barcode}")
async def scan_product_barcode(barcode: str, db: Session = Depends(get_db)):
    try:
        local_unit = db.query(ProductUnit).filter(ProductUnit.unitSku == barcode).first()
        if local_unit:
            product = db.query(Product).filter(Product.idProduct == local_unit.idProduct).first()
            return {
                "rCode": 1,
                "rMsg": "Tìm thấy sản phẩm trong hệ thống local",
                "rData": {
                    "source": "local", 
                    "product": {
                        "idProduct": product.idProduct,
                        "sku": product.sku,
                        "nameProduct": product.nameProduct,
                        "basePrice": product.basePrice
                    }, 
                    "unit": {
                        "idUnit": local_unit.idUnit,
                        "unitSku": local_unit.unitSku,
                        "unitPrice": local_unit.unitPrice,
                        "conversionFactor": local_unit.conversionFactor
                    }
                }
            }
            
        external_data = await fetch_bachhoaxanh_barcode(barcode)
        if external_data:
            return {
                "rCode": 2,
                "rMsg": "Tìm thấy sản phẩm mới từ đám mây Cloud",
                "rData": {
                    "source": "cloud",
                    "sku": f"SP-AUTO-{barcode}",
                    "nameProduct": external_data["name"],
                    "imageProduct": external_data["image"],
                    "description": external_data["description"],
                    "unitSku": barcode,
                    "status": "PENDING" 
                }
            }
            
        return {
            "rCode": 0,
            "rMsg": "Mã vạch mới lạ, vui lòng điền tay thông tin sản phẩm",
            "rData": {"source": "unknown", "unitSku": barcode}
        }
    except Exception as e:
        return {"rCode": 0, "rMsg": f"Lỗi quét mã vạch: {str(e)}", "rData": None}
    
@router.get("/download-template")
def download_template():
    try:
        # 1. Tạo một Workbook mới trong bộ nhớ
        wb = openpyxl.Workbook()
        
        # --- SHEET 1: TEMPLATE IMPORT ---
        ws_template = wb.active
        ws_template.title = "Template Import"
        
        # Định nghĩa các tiêu đề cột (ĐÃ BỎ CỘT NHÀ CUNG CẤP)
        headers = [
            "Mã Sản Phẩm (SKU)", "Tên Sản Phẩm", "ID Danh Mục", "Tồn kho hiện tại", 
            "Cảnh báo Min", "Mô tả", "Mã Đơn Vị Gốc (idUnit)", "Mã SKU Đơn Vi", 
            "Hệ Số Quy Đổi", "Giá Nhập", "Giá Bán", "Đơn Vị Cơ Sở? (X)"
        ]
        ws_template.append(headers)
        
        # Thêm 2 dòng dữ liệu mẫu (Ví dụ cụ thể về việc gộp dòng quy cách đơn vị)
        sample_data = [
            ["SP-333", "Bia 333 Lon 330ml", "29cbba19-ca92-4f46-9773-6aac4f1e044d", 240, 24, "Bia 333 vị truyền thống", "334e3d26-f8cc-4cb5-80ff-f0fb9f69c952", "8934563114112", 1, 10500, 12500, "X"],
            ["", "", "", "", "", "", "66a47358-bdb5-4426-bd50-987c771a4ee3", "8934563114211", 24, 245000, 265000, ""],
        ]
        for row in sample_data:
            ws_template.append(row)
            
        # Styling cho Đẹp và Chuyên nghiệp
        header_fill = PatternFill(start_color="F97316", end_color="F97316", fill_type="solid") # Màu cam trùng UI
        header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
        center_align = Alignment(horizontal="center", vertical="center", wrap_text=True)
        thin_border = Border(
            left=Side(style='thin', color='D1D5DB'),
            right=Side(style='thin', color='D1D5DB'),
            top=Side(style='thin', color='D1D5DB'),
            bottom=Side(style='thin', color='D1D5DB')
        )
        
        # Thiết kế Header
        ws_template.row_dimensions[1].height = 28
        for cell in ws_template[1]:
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = center_align
            cell.border = thin_border
            
        # Thiết kế Data rows
        for row in ws_template.iter_rows(min_row=2, max_row=3):
            for cell in row:
                cell.font = Font(name="Arial", size=10)
                cell.border = thin_border
        
        # Tự động căn rộng cột
        for col in ws_template.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws_template.column_dimensions[col_letter].width = max(max_len + 3, 14)

        # 2. Ghi luồng dữ liệu ra BytesIO
        file_stream = io.BytesIO()
        wb.save(file_stream)
        file_stream.seek(0)
        
        # 3. Trả file về cho client dưới dạng stream tải xuống
        return StreamingResponse(
            file_stream,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=template_import_products.xlsx"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Không thể tạo template: {str(e)}")