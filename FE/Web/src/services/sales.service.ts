import axiosClient from "@/lib/axios";


export interface SaleDetailCreate {
  idProduct: string;
  idProductUnit?: string | null;  
  quantity: number;
  unitPrice: number;
}

export interface SaleCreate {
  items: SaleDetailCreate[];
}

export interface BaseResponse<T> {
  rCode: number;
  rMsg: string;
  rData: T;
}

export const salesService = {

  createInvoice: async (payload: SaleCreate): Promise<BaseResponse<any>> => {
    const response = await axiosClient.post<BaseResponse<any>>("/sales/invoice", payload);
    
    return response.data;
  },
  // 2. API: Lấy toàn bộ danh sách lịch sử giao dịch bán lẻ
  getAllInvoices: () => axiosClient.get(`/sales/invoice`),

  // 3. API: Lấy chi tiết hóa đơn theo ID để phục vụ in lại ấn biên lai
  getInvoiceById: (id: string) => axiosClient.get(`/sales/invoice/${id}`),
};