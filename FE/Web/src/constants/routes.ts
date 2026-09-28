export const ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: (id: string | number) => `/products/${id}`,
  CART: "/cart",
  LOGIN: "/login",
  ADMIN: {
    DASHBOARD: "/admin",
    INVENTORY: "/admin/inventory",
    ORDERS: "/admin/orders",
  }
} as const;