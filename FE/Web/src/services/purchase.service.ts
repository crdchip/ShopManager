// src/services/purchase.service.ts
import axiosClient from "@/lib/axios";


export interface PurchaseDetailCreate {
  idProduct: string;
  idProductUnit?: string | null;
  quantity: number;
  importPrice: number;
  expiryDate?: string | null;
  batchNumber?: string | null;
  nameProduct?: string;
  isUpdateBasePrice: boolean;
}

export interface PurchaseOrderCreate {
  poNumber: string;
  idSuppliers: string;
  note?: string | null;
  createdBy?: string | null;
  items: PurchaseDetailCreate[];
}
export interface APIResponse<T> {
  rCode: number;
  rMsg: string;
  rData: T;
}

export const purchaseService = {
  createOrder: (payload: PurchaseOrderCreate) =>
    axiosClient.post<APIResponse<null>>("/orders/purchase/", payload).then(res => res.data),

  getAllOrders: () =>
    axiosClient.get<APIResponse<any[]>>("/orders/purchase/").then(res => res.data),

  getOrderById: (id: string) =>
    axiosClient.get<APIResponse<any>>(`/orders/purchase/${id}`).then(res => res.data),
};