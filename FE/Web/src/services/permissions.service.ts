// src/services/permissions.service.ts
import axiosClient from "@/lib/axios";

export interface Permission {
  idPermission: string;
  permKey: string;
  permName: string;
  module: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}


export const permissionService = {
  getAll: () => axiosClient.get(`/permissions/`),
  create: (payload: Omit<Permission, "idPermission">) =>
    axiosClient.post(`/permissions/create`, payload),
  update: (id: string, payload: Partial<Permission>) =>
    axiosClient.put(`/permissions/update/${id}`, payload),
  delete: (id: string) =>
    axiosClient.delete(`/permissions/delete/${id}`),
};