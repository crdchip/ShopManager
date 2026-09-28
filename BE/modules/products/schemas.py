from pydantic import BaseModel, Field, ConfigDict, model_validator, computed_field
from typing import Optional, List
from decimal import Decimal

class ProductUnitBase(BaseModel):
    idUnit: str
    unitSku: str
    conversionFactor: Decimal = Field(..., ge=1, decimal_places=2)
    unitPrice: Decimal = Field(..., ge=0, decimal_places=2)
    purchasePrice: Decimal = Field(default=0.0, ge=0, decimal_places=2)
    isBaseUnit: bool = False

class ProductUnitCreate(ProductUnitBase):
    pass

class ProductUnitResponse(ProductUnitBase):
    idProductUnit: str

    model_config = ConfigDict(from_attributes=True)

    # Sử dụng @computed_field để Pydantic tự động bốc từ relationship unit_detail sang
    @computed_field
    @property
    def unitName(self) -> Optional[str]:
        # Kiểm tra xem đối tượng ORM truyền vào có relationship unit_detail chưa
        if hasattr(self, "unit_detail") and self.unit_detail:
            return getattr(self, "unit_detail").unitName
        # Nếu data truyền vào dạng dict (ví dụ test-case)
        if isinstance(self, dict) and "unit_detail" in self:
            return self["unit_detail"].get("unitName") if isinstance(self["unit_detail"], dict) else getattr(self["unit_detail"], "unitName", None)
        return None

# Schema Sản phẩm chính
class ProductBase(BaseModel):
    sku: str = Field(..., max_length=50)
    nameProduct: str = Field(..., max_length=255)
    idCategory: Optional[str] = Field(None, max_length=36)
    currentStock: Decimal = Field(default=0.0, decimal_places=2)
    minStock: Decimal = Field(default=0.0, decimal_places=2)
    basePrice: Decimal = Field(..., ge=0, decimal_places=2)
    purchasePrice: Decimal = Field(..., ge=0, decimal_places=2)
    description: Optional[str] = None
    imageProduct: Optional[str] = None

class ProductCreate(ProductBase):
    idProduct: Optional[str] = Field(None, max_length=36)
    unitsData: List[ProductUnitCreate] = []

    @model_validator(mode="before")
    @classmethod
    def validate_and_map_prices(cls, data):
        # Nếu data là dict (dữ liệu gửi lên)
        if isinstance(data, dict):
            units = data.get("unitsData", [])
            # Tìm đơn vị cơ sở
            base_unit = next((u for u in units if u.get("isBaseUnit") == True), None)
            
            if base_unit:
                # Tự động gán giá từ con lên cha để thỏa mãn Database
                if "basePrice" not in data or data["basePrice"] == 0:
                    data["basePrice"] = base_unit.get("unitPrice")
                if "purchasePrice" not in data or data["purchasePrice"] == 0:
                    data["purchasePrice"] = base_unit.get("purchasePrice")
        return data

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    nameProduct: Optional[str] = None
    idCategory: Optional[str] = None
    currentStock: Optional[Decimal] = None
    minStock: Optional[Decimal] = None
    basePrice: Optional[Decimal] = None
    purchasePrice: Optional[Decimal] = None
    description: Optional[str] = None
    imageProduct: Optional[str] = None
    unitsData: Optional[List[ProductUnitCreate]] = None

class ProductResponse(ProductBase):
    idProduct: str
    product_units: List[ProductUnitResponse] = [] # Trả kèm đầy đủ thông tin quy đổi
    
    model_config = ConfigDict(from_attributes=True)