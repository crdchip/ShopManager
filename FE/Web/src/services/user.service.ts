import axiosClient from "@/lib/axios";

export interface UserDetail {
  idUsers: string; 
  username: string;
  fullName: string; 
  role?: string;
}

export const userService = {
  getUsers: () => axiosClient.get(`/users/`),
  createUser: (data: any) => axiosClient.post(`/users/`, data),
  // Lưu ý: FastAPI của bạn đang mong đợi idUsers hoặc idUser tùy theo route
  updateUser: (id: string, data: any) => axiosClient.put(`/users/${id}`, data),
  deleteUser: (id: string) => axiosClient.delete(`/users/${id}`),
  login: async (data: any) => {
    const response = await axiosClient.post(`/users/login`, data);
    return response.data; 
  },
};

