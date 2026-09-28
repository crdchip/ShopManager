import axiosClient from "@/lib/axios";

export interface Permission {
  idPermission: string;
  permKey: string;
  permName: string;
  module: string;
}

export interface Role {
  idRole: string;
  roleName: string;
  description: string | null;
  isActive: number;
  permissions: Permission[];
}

export interface APIResponse<T> {
  rCode: number;
  rMsg: string;
  rData: T;
}

export interface RolePayload {
  roleName: string;
  description: string | null;
  isActive?: number; 
  createdBy?: string;
  permissions: string[];
}

export const roleService = {
  // Lấy toàn bộ danh sách vai trò kèm quyền hạn
  getAll: () => axiosClient.get<APIResponse<Role[]>>(`/roles/`),
  
  // Chi tiết 1 vai trò
  getById: (id: string) => axiosClient.get<APIResponse<Role>>(`/roles/?idRole=${id}`),

  // Thêm mới vai trò (Sửa endpoint khớp với @router.post("/create"))
  create: (data: RolePayload) => 
    axiosClient.post<APIResponse<Role>>(`/roles/create`, data),
  
  // Cập nhật thông tin vai trò và phân lại quyền (Sửa endpoint khớp với @router.put("/{idRole}"))
  update: (id: string, data: RolePayload) => 
    axiosClient.put<APIResponse<Role>>(`/roles/${id}`, data),
  
  // Xóa vai trò
  delete: (id: string) => 
    axiosClient.delete<APIResponse<null>>(`/roles/${id}`),

  // GỌI BỔ SUNG: Lấy toàn bộ danh mục Permissions hiện có trong hệ thống để người dùng chọn
  getAllPermissions: () => 
    axiosClient.get<APIResponse<Permission[]>>(`/permissions/`), 
};