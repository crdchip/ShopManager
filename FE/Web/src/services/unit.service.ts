import axiosClient from "@/lib/axios";

export interface Unit {
  idUnit: string;
  unitName: string;
  description: string | null;
  isActive: boolean; // Đồng bộ dạng boolean theo FastAPI
}

export interface APIResponse<T> {
  rCode: number;
  rMsg: string;
  rData: T;
}

export const unitService = {
  // Nhận về đúng cấu trúc gói bọc dữ liệu APIResponse
  getAll: () => axiosClient.get<APIResponse<Unit[]>>(`/units/`),
  
  create: (data: Omit<Unit, "idUnit"> & { createdBy?: string }) => 
    axiosClient.post<APIResponse<Unit>>(`/units/add`, data),
  
  update: (id: string, data: Partial<Unit>) => 
    axiosClient.put<APIResponse<Unit>>(`/units/update/${id}`, data),
  
  delete: (id: string) => 
    axiosClient.delete<APIResponse<null>>(`/units/delete/${id}`),
};