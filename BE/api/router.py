from fastapi import APIRouter
from api.endpoints import products, orders, suppliers, categories, units, users, permissions, roles, sales, dashboard

api_router = APIRouter()

api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])

# Các API liên quan tới sản phẩm sẽ có tiền tố /products
api_router.include_router(products.router, prefix="/products", tags=["Quản lý Sản phẩm"])

api_router.include_router(orders.router, prefix="/orders" , tags=["Quản lý Đơn hàng nhập"] )

api_router.include_router(sales.router, prefix="/sales", tags=["Sales Management"])

# Các API liên quan tới nhà cung cấp sẽ có tiền tố /suppliers
api_router.include_router(suppliers.router, prefix="/suppliers", tags=["Quản lý Nhà cung cấp"])
# api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])

# Các API liên quan tới danh mục sẽ có tiền tố /categories
api_router.include_router(categories.router, prefix="/categories", tags=["Quản lý Danh mục"])

# Các API liên quan tới đơn vị sẽ có tiền tố /units
api_router.include_router(units.router, prefix="/units", tags=["Quản lý Đơn vị"])

# Các API liên quan tới người dùng sẽ có tiền tố /users
api_router.include_router(users.router, prefix="/users", tags=["Quản lý Người dùng"])

# Các API liên quan tới quyền sẽ có tiền tố /permissions
api_router.include_router(permissions.router, prefix="/permissions", tags=["Quản lý Quyền"])

# Các API liên quan tới role
api_router.include_router(roles.router, prefix="/roles", tags=["Quản lý phân quyền"] )





