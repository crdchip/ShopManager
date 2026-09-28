'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { purchaseService } from '@/services/purchase.service';

export default function PurchaseManagementPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await purchaseService.getAllOrders();
            if (res && res.rCode === 1) {
                setOrders(res.rData || []);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Lỗi tải đơn hàng:", error);
            setOrders([]);
        } finally { // ⚡ Đã sửa từ 'chunks:' thành 'finally:' để tránh lỗi crash compile
            setLoading(false);
        }
    };

    const openDetail = (order: any) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    // Hàm xác định trạng thái thanh toán bằng Badge trực quan
    const renderPaymentStatus = (status: number) => {
        if (status === 1) {
            return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Đã thanh toán</span>;
        }
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">Chờ thanh toán</span>;
    };

    // Hàm định dạng ngày tháng hiển thị thân thiện
    const formatDate = (dateString: string) => {
        if (!dateString) return "---";
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
                <div>
                    {/* 🌟 BREADCRUMB STYLE: TRANG CHỦ - NHẬP HÀNG */}
                    <nav className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-3 select-none">
                        {/* Cấp 1: Trang chủ */}
                        <Link
                            href="/"
                            className="hover:text-indigo-600 transition-colors"
                        >
                            Trang chủ
                        </Link >

                        {/* Ký tự phân cách tĩnh */}
                        <span className="text-gray-400">-</span>

                        {/* Cấp 2: Trang hiện tại (Màu đậm hơn, không click lại chính nó) */}
                        {/* <span className="text-gray-700">Nhập hàng</span> */}
                        <Link
                            href="/purchase"
                            className="hover:text-indigo-600 transition-colors"
                        >
                            Nhập hàng
                        </Link >
                    </nav>

                    {/* Tiêu đề chính */}
                    <h1 className="text-2xl font-bold text-indigo-700">Quản lý Đơn Nhập Hàng</h1>
                    <p className="text-sm text-gray-500 mt-1">Xem danh sách lịch sử nhập hàng và chi tiết từng hóa đơn</p>
                </div>
            </div>

            {/* DANH SÁCH SHOW THÔNG TIN CHÍNH */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Mã Đơn (PO)</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Nhà cung cấp</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Ngày cập nhật</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm">Người tạo</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm text-center">Trạng thái</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm text-right">Tổng tiền nhập</th>
                            <th className="p-4 font-semibold text-gray-600 text-sm text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan={7} className="text-center py-10 text-gray-400 italic">Đang tải dữ liệu đơn nhập...</td></tr>
                        ) : orders.length === 0 ? (
                            <tr><td colSpan={7} className="text-center py-10 text-gray-400">Chưa có đơn nhập kho nào trong hệ thống</td></tr>
                        ) : (
                            orders.map((order: any) => (
                                <tr key={order.idPurchaseOrder} className="hover:bg-indigo-50/30 transition-colors">
                                    <td className="p-4 font-mono text-sm text-indigo-600 font-bold">{order.poNumber}</td>
                                    <td className="p-4 text-sm font-semibold text-gray-700">
                                        {order.supplier?.nameSuppliers || "---"}
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {formatDate(order.updatedAt)}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">{order.createdBy}</span>
                                    </td>
                                    <td className="p-4 text-sm text-center">
                                        {renderPaymentStatus(order.paymentStatus)}
                                    </td>
                                    <td className="p-4 text-sm text-right font-bold text-red-600">
                                        {Number(order.totalCost).toLocaleString()} đ
                                    </td>
                                    <td className="p-4 text-center">
                                        <button
                                            onClick={() => openDetail(order)}
                                            className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 font-medium text-xs transition-colors"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* POPUP XEM THÔNG TIN CHI TIẾT */}
            {isModalOpen && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animation-fadeIn">
                        {/* Header Popup */}
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-indigo-600 text-white">
                            <div>
                                <span className="text-xs bg-indigo-700 px-2.5 py-1 rounded-md font-mono font-bold uppercase tracking-wider">Phiếu Nhập Hàng</span>
                                <h2 className="text-xl font-bold mt-1">Mã PO: {selectedOrder.poNumber}</h2>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-white/80 hover:text-white text-2xl font-semibold p-1 hover:bg-white/10 rounded-lg transition-colors leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Nội dung thông tin nhà cung cấp & Đơn hàng tổng quát */}
                        <div className="p-6 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <p className="text-gray-400 font-medium">Thông tin nhà cung cấp</p>
                                <p className="font-bold text-gray-800 mt-0.5">{selectedOrder.supplier?.nameSuppliers || '---'}</p>
                                <p className="text-gray-500 text-xs mt-0.5">SĐT: {selectedOrder.supplier?.phoneSuppliers || '---'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 font-medium">Thời gian hoàn thành</p>
                                <p className="font-semibold text-gray-700 mt-0.5">{formatDate(selectedOrder.updatedAt)}</p>
                                <p className="text-gray-500 text-xs mt-0.5">Người duyệt: {selectedOrder.createdBy}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 font-medium">Ghi chú đơn</p>
                                <p className="text-gray-600 italic mt-0.5 text-xs">{selectedOrder.note || 'Không có ghi chú nào cho đơn hàng này'}</p>
                            </div>
                        </div>

                        {/* Bảng danh sách chi tiết mặt hàng nhập */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="border-b border-gray-200 pb-2">
                                    <tr>
                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Tên sản phẩm / Mã vạch</th>
                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Đơn vị nhập</th>
                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Số lượng</th>
                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Giá nhập gốc</th>
                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {selectedOrder.details?.map((item: any, idx: number) => {
                                        let displayUnit = "Đơn vị gốc";

                                        if (item.product_unit?.unitName) {
                                            displayUnit = item.product_unit.unitName;
                                        } else if (item.product_unit?.unitSku) {
                                            displayUnit = item.product_unit.unitSku;
                                        } else if (item.product?.nameProduct) {
                                            const nameLower = item.product.nameProduct.toLowerCase();
                                            if (nameLower.includes("lon")) displayUnit = "Lon";
                                            else if (nameLower.includes("chai")) displayUnit = "Chai";
                                            else if (nameLower.includes("thùng")) displayUnit = "Thùng";
                                        }

                                        return (
                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                <td className="py-4">
                                                    <p className="font-bold text-gray-800">{item.product?.nameProduct || 'Sản phẩm đã xóa'}</p>
                                                    <p className="text-xs text-gray-400">Mã sản phẩm: {item.idProduct}</p>
                                                </td>
                                                <td className="py-4 text-center">
                                                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 uppercase">
                                                        {displayUnit}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-center font-semibold">{item.quantity}</td>
                                                <td className="py-4 text-right">{Number(item.importPrice).toLocaleString()} đ</td>
                                                <td className="py-4 text-right font-bold text-indigo-700">
                                                    {(item.quantity * item.importPrice).toLocaleString()} đ
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Popup tính tổng tiền */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                            <div>
                                <p className="text-xs text-gray-400 font-medium">Tổng giá trị phiếu nhập</p>
                                <p className="text-2xl font-black text-red-600 mt-0.5">
                                    {Number(selectedOrder.totalCost).toLocaleString()} đ
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-semibold text-sm transition-colors"
                            >
                                Đóng giao diện
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}