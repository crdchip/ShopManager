'use client';



import React, { useState, useEffect } from 'react';

import Link from 'next/link';

import { salesService } from '@/services/sales.service';

import { userService } from '@/services/user.service';



export default function SalesManagementPage() {

    const [invoices, setInvoices] = useState<any[]>([]);

    const [userMap, setUserMap] = useState<{ [key: string]: string }>({});

    const [loading, setLoading] = useState(true);



    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);



    useEffect(() => {

        fetchInvoices();

        fetchUsersData();

    }, []);



    const fetchInvoices = async () => {

        try {

            const res = await salesService.getAllInvoices();

            if (res.data && res.data.rCode === 1) {

                setInvoices(res.data.rData || []);

            } else {

                setInvoices([]);

            }

        } catch (error) {

            console.error("Lỗi tải danh sách hóa đơn:", error);

            setInvoices([]);

        } finally {

            setLoading(false);

        }

    };



    const fetchUsersData = async () => {

        try {

            const res = await userService.getUsers();

            // Khớp với cấu trúc rCode / rData chuẩn hệ thống của bạn

            if (res.data && res.data.rCode === 1) {

                const usersList = res.data.rData || [];



                // Chuyển mảng thành Object Map: { "id_user_uuid": "Tên Nhân Viên" }

                const mapping: { [key: string]: string } = {};

                usersList.forEach((user: any) => {

                    // Bạn check lại xem BE dùng trường idUsers, idUser hay id để map cho chuẩn nhé

                    const userId = user.idUsers || user.idUser || user.id;

                    const userNameDisplay = user.fullName || user.username || "Nhân viên viên quầy";

                    if (userId) {

                        mapping[userId] = userNameDisplay;

                    }

                });

                setUserMap(mapping);

            }

        } catch (error) {

            console.error("Lỗi đồng bộ danh sách tài khoản thu ngân:", error);

        }

    };



    const openDetail = (invoice: any) => {

        setSelectedInvoice(invoice);

        setIsModalOpen(true);

    };



    // Hàm định dạng ngày tháng hiển thị thân thiện tại quầy

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



    const getSellerName = (idSeller: string) => {

        if (!idSeller) return "Thu ngân hệ thống";

        return userMap[idSeller] || idSeller;

    };



    return (

        <div className="p-6 bg-gray-50 min-h-screen text-gray-800">

            {/* Header / Breadcrumbs */}

            <div className="flex justify-between items-start mb-6">

                <div>

                    <nav className="flex items-center gap-2 text-sm text-gray-500 font-medium mb-3 select-none">

                        <Link href="/" className="hover:text-indigo-600 transition-colors">

                            Trang chủ

                        </Link>

                        <span className="text-gray-400">-</span>

                        <Link href="/sales" className="hover:text-indigo-600 transition-colors">

                            Bán hàng

                        </Link>

                    </nav>



                    <h1 className="text-2xl font-bold text-emerald-700">Quản lý Hóa Đơn Bán Hàng</h1>

                    <p className="text-sm text-gray-500 mt-1">Xem lịch sử doanh thu giao dịch và chi tiết biên lai tại quầy</p>

                </div>

            </div>



            {/* BẢNG LỊCH SỬ GIAO DỊCH CHÍNH */}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                <table className="w-full text-left border-collapse">

                    <thead className="bg-gray-50 border-b border-gray-200">

                        <tr>

                            <th className="p-4 font-semibold text-gray-600 text-sm">Mã Hóa Đơn (ID)</th>

                            <th className="p-4 font-semibold text-gray-600 text-sm">Thời gian bán</th>

                            <th className="p-4 font-semibold text-gray-600 text-sm">Nhân viên thu ngân</th>

                            <th className="p-4 font-semibold text-gray-600 text-sm text-center">Trạng thái</th>

                            <th className="p-4 font-semibold text-gray-600 text-sm text-right">Tổng tiền hóa đơn</th>

                            <th className="p-4 font-semibold text-gray-600 text-sm text-center">Hành động</th>

                        </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-100">

                        {loading ? (

                            <tr><td colSpan={6} className="text-center py-10 text-gray-400 italic">Đang tải lịch sử bán hàng...</td></tr>

                        ) : invoices.length === 0 ? (

                            <tr><td colSpan={6} className="text-center py-10 text-gray-400">Hệ thống chưa ghi nhận hóa đơn bán lẻ nào</td></tr>

                        ) : (

                            invoices.map((invoice: any) => (

                                <tr key={invoice.idSale} className="hover:bg-emerald-50/20 transition-colors">

                                    <td className="p-4 font-mono text-xs text-emerald-600 font-bold uppercase">

                                        #{invoice.idSale.substring(0, 8)}...

                                    </td>

                                    <td className="p-4 text-sm text-gray-500">

                                        {formatDate(invoice.saleDate || invoice.createdAt)}

                                    </td>

                                    <td className="p-4 text-sm text-gray-700 font-medium">

                                        {getSellerName(invoice.idSeller)}

                                    </td>

                                    <td className="p-4 text-sm text-center">

                                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">

                                            Thành công

                                        </span>

                                    </td>

                                    <td className="p-4 text-sm text-right font-bold text-emerald-600">

                                        {Number(invoice.totalAmount).toLocaleString()} đ

                                    </td>

                                    <td className="p-4 text-center">

                                        <button

                                            onClick={() => openDetail(invoice)}

                                            className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-md hover:bg-emerald-100 font-medium text-xs transition-colors"

                                        >

                                            Xem chi tiết / In bill

                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>



            {/* MODAL POPUP XEM CHI TIẾT BIÊN LAI BÁN LẺ */}

            {isModalOpen && selectedInvoice && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">

                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">



                        {/* Header Popup */}

                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-emerald-600 text-white">

                            <div>

                                <span className="text-xs bg-emerald-700 px-2.5 py-1 rounded-md font-mono font-bold uppercase tracking-wider">Hóa Đơn Bán Lẻ</span>

                                <h2 className="text-lg font-mono mt-1">ID: {selectedInvoice.idSale}</h2>

                            </div>

                            <button

                                onClick={() => setIsModalOpen(false)}

                                className="text-white/80 hover:text-white text-2xl font-semibold p-1 hover:bg-white/10 rounded-lg transition-colors leading-none"

                            >

                                &times;

                            </button>

                        </div>



                        {/* Thông tin chung */}

                        <div className="p-6 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                            <div>

                                <p className="text-gray-400 font-medium">Thời gian giao dịch</p>

                                <p className="font-semibold text-gray-700 mt-0.5">{formatDate(selectedInvoice.saleDate || selectedInvoice.createdAt)}</p>

                            </div>

                            <div>

                                <p className="text-gray-400 font-medium">Nhân viên lập phiếu</p>

                                <p className="font-semibold text-gray-700 mt-0.5">{selectedInvoice.idSeller || 'Thu ngân tại quầy'}</p>

                            </div>

                        </div>



                        {/* Danh sách mặt hàng mua */}

                        <div className="p-6 overflow-y-auto flex-1">

                            <table className="w-full text-left border-collapse">

                                <thead className="border-b border-gray-200 pb-2">

                                    <tr>

                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Tên mặt hàng</th>

                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Đơn vị bán</th>

                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Số lượng</th>

                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Đơn giá</th>

                                        <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-400 text-right">Thành tiền</th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-gray-100">

                                    {selectedInvoice.details?.map((item: any, idx: number) => {

                                        // Xử lý hiển thị đơn vị quy đổi tương tự phần đơn nhập hàng của bạn

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

                                                    <p className="font-bold text-gray-800">{item.product?.nameProduct || 'Sản phẩm không tồn tại hoặc đã xóa'}</p>

                                                    {item.product?.sku && <p className="text-xs text-gray-400">Barcode / SKU: {item.product.sku}</p>}

                                                </td>

                                                <td className="py-4 text-center">

                                                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">

                                                        {displayUnit}

                                                    </span>

                                                </td>

                                                <td className="py-4 text-center font-semibold text-gray-700">{item.quantity}</td>

                                                <td className="py-4 text-right text-gray-600">{Number(item.unitPrice).toLocaleString()} đ</td>

                                                <td className="py-4 text-right font-bold text-emerald-700">

                                                    {(item.quantity * item.unitPrice).toLocaleString()} đ

                                                </td>

                                            </tr>

                                        );

                                    })}

                                </tbody>

                            </table>

                        </div>



                        {/* Footer tổng kết hóa đơn lẻ */}

                        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center">

                            <div>

                                <p className="text-xs text-gray-400 font-medium">Khách cần thanh toán (Tổng Bill)</p>

                                <p className="text-2xl font-black text-emerald-600 mt-0.5">

                                    {Number(selectedInvoice.totalAmount).toLocaleString()} đ

                                </p>

                            </div>

                            <div className="flex gap-2">

                                <button

                                    onClick={() => window.print()}

                                    className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg font-semibold text-sm transition-colors shadow-sm"

                                >

                                    In hóa đơn (K80)

                                </button>

                                <button

                                    onClick={() => setIsModalOpen(false)}

                                    className="px-4 py-2 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg font-semibold text-sm transition-colors"

                                >

                                    Đóng

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}