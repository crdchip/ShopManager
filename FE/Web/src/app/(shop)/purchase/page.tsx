'use client';

import React, { useState, useEffect } from 'react';
import { productService, Product, ProductUnit } from '@/services/product.service';
import { supplierService } from '@/services/supplier.service';
import { purchaseService, PurchaseDetailCreate } from '@/services/purchase.service';
import Link from 'next/link';

interface Supplier {
    idSuppliers: string;
    nameSuppliers: string;
}

export default function PurchasePage() {
    // Data từ API
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [availableUnits, setAvailableUnits] = useState<ProductUnit[]>([]);
    const [isUpdateBasePrice, setIsUpdateBasePrice] = useState<boolean>(false);

    // State Đơn hàng tổng
    const [poNumber, setPoNumber] = useState('');
    const [selectedSupplier, setSelectedSupplier] = useState('');
    const [note, setNote] = useState('');
    const [cartItems, setCartItems] = useState<PurchaseDetailCreate[]>([]);

    // State Tìm kiếm nâng cao bằng unitSku
    const [searchSku, setSearchSku] = useState('');
    const [searchError, setSearchError] = useState('');

    // State Form thêm sản phẩm
    const [currentProductId, setCurrentProductId] = useState('');
    const [selectedUnitId, setSelectedUnitId] = useState('');
    const [quantity, setQuantity] = useState<number>(1);
    const [importPrice, setImportPrice] = useState<number>(0);
    const [batchNumber, setBatchNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');

    const generatePoNumber = () => {
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        return `PO-${dateStr}-${Math.floor(1000 + Math.random() * 9000)}`;
    };

    useEffect(() => {
        setPoNumber(generatePoNumber());

        productService.getAll().then((res) => {
            if (res.data.rCode === 1) setProducts(res.data.rData);
        }).catch(err => console.error("Lỗi tải sản phẩm", err));

        supplierService.getAll().then((res) => {
            const data = res.data.rData ? res.data.rData : res.data;
            setSuppliers(data);
        }).catch(err => console.error("Lỗi tải nhà cung cấp", err));
    }, []);

    const handleSearchByUnitSku = (skuValue: string) => {
        setSearchSku(skuValue);
        setSearchError('');
        if (!skuValue.trim()) return;

        let foundProduct: Product | null = null;
        let foundUnit: ProductUnit | null = null;

        for (const p of products) {
            if (p.product_units) {
                const u = p.product_units.find(unit => unit.unitSku?.toLowerCase() === skuValue.trim().toLowerCase());
                if (u) {
                    foundProduct = p;
                    foundUnit = u;
                    break;
                }
            }
        }

        if (foundProduct && foundUnit) {
            setCurrentProductId(foundProduct.idProduct);
            setAvailableUnits(foundProduct.product_units || []);
            setSelectedUnitId(foundUnit.idProductUnit);
            setImportPrice(Number(foundUnit.purchasePrice));
            setQuantity(1);
        } else {
            setSearchError('Không tìm thấy quy cách này!');
        }
    };

    const handleProductChange = (id: string) => {
        setCurrentProductId(id);
        setSelectedUnitId('');
        setAvailableUnits([]);
        setImportPrice(0);
        setSearchSku('');

        const prod = products.find(p => p.idProduct === id);
        if (prod) {
            if (prod.product_units && prod.product_units.length > 0) {
                setAvailableUnits(prod.product_units);
                const baseUnit = prod.product_units.find(u => u.isBaseUnit);
                if (baseUnit) {
                    setSelectedUnitId(baseUnit.idProductUnit);
                    setImportPrice(Number(baseUnit.purchasePrice) > 0 ? Number(baseUnit.purchasePrice) : Number(prod.basePrice));
                } else {
                    setSelectedUnitId(prod.product_units[0].idProductUnit);
                    setImportPrice(Number(prod.product_units[0].purchasePrice));
                }
            } else {
                setImportPrice(Number(prod.purchasePrice) > 0 ? Number(prod.purchasePrice) : Number(prod.basePrice));
            }
        }
    };

    const handleUnitChange = (productUnitId: string) => {
        setSelectedUnitId(productUnitId);
        const unitOpt = availableUnits.find(u => u.idProductUnit === productUnitId);
        if (unitOpt) {
            setImportPrice(Number(unitOpt.purchasePrice));
            if (unitOpt.unitSku) setSearchSku(unitOpt.unitSku);
        }
    };

    const handleAddToCard = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProductId || quantity <= 0 || importPrice <= 0) return;

        const targetProd = products.find(p => p.idProduct === currentProductId);
        const targetUnit = availableUnits.find(u => u.idProductUnit === selectedUnitId);
        const unitNameDisplay = targetUnit?.unitName || targetUnit?.unitSku || 'Đơn vị gốc';

        const newItem: PurchaseDetailCreate = {
            idProduct: currentProductId,
            idProductUnit: selectedUnitId || null,
            nameProduct: `${targetProd?.nameProduct} (${unitNameDisplay})`,
            quantity: Number(quantity),
            importPrice: Number(importPrice),
            batchNumber: batchNumber || null,
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
            isUpdateBasePrice: isUpdateBasePrice,
        };

        setCartItems([...cartItems, newItem]);
        setIsUpdateBasePrice(false);

        setCurrentProductId('');
        setSelectedUnitId('');
        setAvailableUnits([]);
        setQuantity(1);
        setImportPrice(0);
        setBatchNumber('');
        setExpiryDate('');
        setSearchSku('');
    };

    const handleRemoveItem = (index: number) => {
        setCartItems(cartItems.filter((_, i) => i !== index));
    };

    const totalCost = cartItems.reduce((sum, item) => sum + item.quantity * item.importPrice, 0);

   const handleSubmitOrder = async () => {
    // 1. Chặn ngay từ Front-end nếu chưa chọn nhà cung cấp hoặc giỏ hàng trống
    // if (!selectedSupplier || selectedSupplier.trim() === '') {
    //     alert('❌ Vui lòng chọn Nhà cung cấp trước khi tạo đơn!');
    //     return;
    // }

    if (cartItems.length === 0) {
        alert('❌ Vui lòng thêm ít nhất một mặt hàng vào giỏ hàng!');
        return;
    }

    try {
        const payload = {
            poNumber,
            idSuppliers: selectedSupplier, // Đảm bảo selectedSupplier đang lưu UUID chính xác
            note: note || null,
            createdBy: 'ADMIN_USER',
            items: cartItems,
        };

        // 2. Gọi API tạo đơn nhập hàng
        const res = await purchaseService.createOrder(payload);

        // 3. Kiểm tra cấu trúc rCode trả về từ Backend của bạn
        if (res && res.rCode === 1) {
            alert('🎉 Tạo đơn nhập hàng thành công!');
            setCartItems([]);
            setNote('');
            setPoNumber(generatePoNumber());
            // Nếu có state hay hàm clear nhà cung cấp đã chọn thì gọi ở đây (ví dụ: setSelectedSupplier(''))
        } else {
            // Trường hợp rCode === 0 hoặc rMsg báo lỗi từ Backend
            alert('⚠️ Thất bại: ' + (res.rMsg || 'Hệ thống xử lý đơn hàng lỗi.'));
        }

    } catch (error: any) {
        // Bắt các lỗi kết nối mạng, sập server (500),...
        console.error("Lỗi submit đơn hàng:", error);
        alert('❌ Không thể kết nối đến máy chủ: ' + (error.message || 'Lỗi không xác định.'));
    }
};

    return (
        <div className="p-4 bg-gray-50 min-h-screen text-gray-800 text-sm">
            {/* ⚡ THANH HEADER ĐIỀU HƯỚNG THU GỌN */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-indigo-600 font-medium transition-colors"
                    >
                        Quay lại trang chủ
                    </Link>
                </div>
                <div>
                    <Link
                        href="/purchase-management"
                        className="inline-flex items-center gap-1.5 bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 font-semibold px-3 py-1.5 rounded-md text-[11px] shadow-sm transition-all"
                    >
                        📋 Xem lịch sử nhập hàng
                    </Link>
                </div>
            </div>

            <h1 className="text-xl font-bold text-indigo-700 mb-4">Lập Phiếu Nhập Hàng (Tích Hợp Quy Đổi)</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* CỘT TRÁI: FORM ĐIỀN THU GỌN */}
                <div className="lg:col-span-6 space-y-4">
                    {/* 1. Thông tin đơn tổng */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-sm font-bold border-b pb-1.5 mb-3 text-gray-700">1. Thông tin đơn nhập</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-0.5">Mã đơn nhập (PO)</label>
                                <input type="text" value={poNumber} onChange={(e) => setPoNumber(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs font-mono outline-none focus:ring-1 focus:ring-indigo-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-0.5">Nhà cung cấp</label>
                                <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="">-- Chọn nhà cung cấp --</option>
                                    {suppliers.map(s => <option key={s.idSuppliers} value={s.idSuppliers}>{s.nameSuppliers}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-0.5">Ghi chú</label>
                                <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Nhập ghi chú ngắn..." />
                            </div>
                        </div>
                    </div>

                    {/* 2. Form thêm mặt hàng */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-sm font-bold border-b pb-1.5 mb-3 text-gray-700">2. Chi tiết mặt hàng</h2>

                        {/* TÌM KIẾM BẰNG UNIT SKU (QUÉT MÃ VẠCH THÙNG/LON) */}
                        <div className="mb-3 bg-indigo-50 p-2.5 rounded-md border border-indigo-100">
                            <label className="block text-[10px] font-bold text-indigo-800 uppercase mb-0.5">
                                Quét mã vạch đơn vị quy đổi (unitSku)
                            </label>
                            <input
                                type="text"
                                placeholder="Gõ hoặc quét mã vạch của Thùng/Hộp/Lon tại đây..."
                                value={searchSku}
                                onChange={(e) => handleSearchByUnitSku(e.target.value)}
                                className="w-full border border-indigo-300 rounded px-2.5 py-1 text-xs font-mono outline-none focus:bg-white shadow-inner"
                            />
                            {searchError && <p className="text-[11px] text-red-500 font-medium mt-0.5">⚠️ {searchError}</p>}
                        </div>

                        <form onSubmit={handleAddToCard} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Sản phẩm chọn tay</label>
                                    <select value={currentProductId} onChange={(e) => handleProductChange(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500">
                                        <option value="">-- Chọn sản phẩm --</option>
                                        {products.map(p => <option key={p.idProduct} value={p.idProduct}>{p.nameProduct}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-indigo-700 mb-0.5">
                                        Đơn vị tính nhận diện
                                    </label>
                                    <select
                                        value={selectedUnitId}
                                        disabled={availableUnits.length === 0}
                                        onChange={(e) => handleUnitChange(e.target.value)}
                                        className="w-full border border-indigo-300 bg-indigo-50/40 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-medium text-gray-700 disabled:bg-gray-100 disabled:border-gray-200 disabled:text-gray-400"
                                    >
                                        {availableUnits.length === 0 ? (
                                            <option value="">-- Gốc / Không có quy đổi --</option>
                                        ) : (
                                            availableUnits.map((u) => {
                                                const nameDisplay = u.unit_detail?.unitName || u.unitName || u.unitSku || "Đơn vị quy đổi";
                                                const factor = Number(u.conversionFactor);
                                                return (
                                                    <option key={u.idProductUnit} value={u.idProductUnit}>
                                                        {nameDisplay} {factor > 1 ? `(x${factor})` : '(Gốc)'}
                                                    </option>
                                                );
                                            })
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* DÀN NGANG HÀNG LOẠT TRƯỜNG THÔNG TIN SỐ LƯỢNG - LÔ - HẠN DÙNG */}
                            <div className="grid grid-cols-4 gap-2.5">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-0.5">SL nhập</label>
                                    <input type="number" min={1} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Giá nhập (đ)</label>
                                    <input type="number" value={importPrice} onChange={(e) => setImportPrice(Number(e.target.value))} className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-indigo-700" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Số lô</label>
                                    <input type="text" placeholder="Batch" value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-0.5">Hạn dùng</label>
                                    <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className="w-full border border-gray-300 rounded px-1 py-1 text-xs outline-none" />
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-0.5">
                                <label className="flex items-center space-x-1.5 text-xs text-indigo-700 cursor-pointer select-none font-medium">
                                    <input
                                        type="checkbox"
                                        checked={isUpdateBasePrice}
                                        onChange={(e) => setIsUpdateBasePrice(e.target.checked)}
                                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5"
                                    />
                                    <span>Cập nhật làm giá nhập mặc định</span>
                                </label>

                                <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-1.5 rounded text-xs transition-colors shadow-sm">
                                    + Thêm vào danh sách
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* CỘT PHẢI: GIỎ HÀNG CHỜ LƯU THU GỌN CHỮ */}
                <div className="lg:col-span-6 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between min-h-95px">
                    <div>
                        <div className="bg-indigo-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-xs text-indigo-900">Chi tiết hàng chuẩn bị nhập kho</span>
                            <span className="bg-indigo-200 text-indigo-800 text-[10px] px-2 py-0.5 rounded-full font-bold">{cartItems.length} Dòng</span>
                        </div>

                        <div className="p-2 max-h-70px overflow-y-auto divide-y divide-gray-100">
                            {cartItems.length === 0 ? (
                                <div className="text-center py-16 text-gray-400 text-xs italic">Hộp nhập kho trống. Quét mã vạch hoặc chọn hàng bên trái.</div>
                            ) : (
                                cartItems.map((item, index) => (
                                    <div key={index} className="py-2 flex justify-between items-center text-xs">
                                        <div className="pr-2">
                                            <h4 className="font-semibold text-gray-900">{item.nameProduct}</h4>
                                            <p className="text-[11px] text-gray-500">
                                                SL: <span className="font-bold text-indigo-600 px-1 bg-indigo-50 rounded">{item.quantity}</span> |
                                                Đơn giá: {item.importPrice.toLocaleString()}đ
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-3 shrink-0">
                                            <span className="font-bold text-indigo-950">{(item.quantity * item.importPrice).toLocaleString()} đ</span>
                                            <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 font-medium underline text-[11px]">Xóa</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-600">TỔNG ĐƠN:</span>
                            <span className="text-lg font-black text-red-600">{totalCost.toLocaleString()} đ</span>
                        </div>
                        <button onClick={handleSubmitOrder} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-md shadow transition-colors text-center text-xs tracking-wide">
                            LƯU PHIẾU & ĐẨY LÊN HỆ THỐNG
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}