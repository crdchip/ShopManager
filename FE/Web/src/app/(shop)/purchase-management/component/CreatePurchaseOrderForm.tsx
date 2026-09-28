// src/app/(shop)/purchase-management/CreatePurchaseOrderForm.tsx
'use client';

import React, { useState } from 'react';

export default function CreatePurchaseOrderForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animation-fadeIn">
            {/* Header Form */}
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Lập Phiếu Nhập Hàng Mới (PO)</h2>
                    <p className="text-xs text-gray-500">Thêm sản phẩm, điều chỉnh số lượng quy đổi và giá nhập kho</p>
                </div>
                <button 
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-sm font-medium bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                    ✕ Hủy lập phiếu
                </button>
            </div>

            {/* Body Form Nghiệp Vụ */}
            <div className="space-y-4 min-h-75px">
                {/* Khu vực bạn code logic: Chọn NCC, Quét Barcode Sản phẩm, Nhập số lượng... */}
                <p className="text-gray-400 italic text-sm">Giao diện thêm sản phẩm nhập kho sẽ hiển thị ở đây...</p>
            </div>

            {/* Footer Form Hành động */}
            <div className="border-t border-gray-100 pt-4 flex justify-end gap-3">
                <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                    Hủy bỏ
                </button>
                <button onClick={onSuccess} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
                    Xác nhận nhập kho
                </button>
            </div>
        </div>
    );
}