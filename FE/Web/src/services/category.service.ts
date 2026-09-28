import axiosClient from "@/lib/axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const categoryService = {
  // Lấy toàn bộ danh mục (GET /categories/)
  getAll: () => axiosClient.get("/categories/"),
  
  // Thêm mới (POST /categories/add)
  create: (data: any) => axiosClient.post("/categories/add", data),
  
  // Cập nhật (PUT /categories/update/:id)
  update: (id: string, data: any) => axiosClient.put(`/categories/update/${id}`, data),
  
  // Xóa mềm (DELETE /categories/delete/:id)
  delete: (id: string) => axiosClient.delete(`/categories/delete/${id}`),
};