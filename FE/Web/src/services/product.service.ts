import axiosClient from "@/lib/axios";

export interface Product {
  idProduct: string;
  sku: string;
  nameProduct: string;
  imageProduct?: string;
  idCategory?: string;
  idSuppliers?: string;
  currentStock: number;
  minStock: number;
  basePrice: number;
  purchasePrice?: number;
  description?: string;
  product_units?: ProductUnit[];
}

export interface ProductUnitInput {
  idUnit: string;
  unitSku: string;
  conversionFactor: number;
  unitPrice: number;
  purchasePrice: number;
  isBaseUnit: boolean;
}

export interface UnitRow {
  idUnit: string;
  conversionFactor: number;
  unitSku: string;
  unitPrice: number;
  purchasePrice: number;
  isBaseUnit: boolean;
}

export interface ProductUnit {
  idProductUnit: string;
  idProduct?: string; // Bổ sung nếu cần
  idUnit: string;
  unitSku: string;
  conversionFactor: number;
  unitPrice: number;
  purchasePrice: number;
  isBaseUnit: boolean;
  unit_detail?: UnitDetail | null;
  unitName: string | null;
}

export interface UnitDetail {
  idUnit: string;
  unitName: string;
  isActive: boolean;
  createdBy?: string | null;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface APIResponse<T> {
  rCode: number;
  rMsg: string;
  rData: T;
}

export const productService = {
  getAll: () => axiosClient.get<APIResponse<Product[]>>(`/products/`),
  create: (data: any) => axiosClient.post<APIResponse<Product>>(`/products/add`, data),
  update: (id: string, data: any) => axiosClient.put<APIResponse<Product>>(`/products/update/${id}`, data),
  delete: (id: string) => axiosClient.delete<APIResponse<null>>(`/products/delete/${id}`),
  importExcel: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post(`/products/import-excel`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  downloadTemplate: () => {
    return axiosClient.get(`/products/download-template`, {
      responseType: "blob",
    });
  }
};