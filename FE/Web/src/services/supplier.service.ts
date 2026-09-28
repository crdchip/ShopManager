import axiosClient from "@/lib/axios";

export const supplierService = {
  // Lấy danh sách (Theo route GET /)
  getAll: () => axiosClient.get(`/suppliers/`),
  
  // Thêm mới (Theo route POST /add)
  create: (data: any) => axiosClient.post(`/suppliers/add`, data),
  
  // Cập nhật (Theo route PUT /update/{id})
  update: (id: string, data: any) => axiosClient.put(`/suppliers/update/${id}`, data),
  
  // Xóa (Theo route DELETE /delete/{id})
  delete: (id: string) => axiosClient.delete(`/suppliers/delete/${id}`),
};