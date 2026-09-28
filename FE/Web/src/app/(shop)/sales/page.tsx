'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { salesService } from '@/services/sales.service';
import { productService, Product, ProductUnit } from '@/services/product.service';
import { userService } from '@/services/user.service';
import Cookies from 'js-cookie'; 

export default function POSPage() {
    const router = useRouter();
    const searchRef = useRef<HTMLDivElement>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<any[]>([]);

    const [idSeller, setIdSeller] = useState('');
    const [sellerName, setSellerName] = useState('Đang xác thực...');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const totalAmount = cart.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    // Đọc Cookie thông tin user đăng nhập
    useEffect(() => {
        const userDataCookie = Cookies.get('userData');
        if (userDataCookie) {
            try {
                const user = JSON.parse(userDataCookie);
                setIdSeller(user.idUsers || user.idUser || user.id || '');
                setSellerName(user.fullName || user.username || 'Thu ngân');
            } catch (e) {
                setSellerName("Thu ngân quầy");
            }
        } else {
            setSellerName("Chưa đăng nhập");
        }
    }, []);

    // Tải danh sách sản phẩm
    useEffect(() => {
        productService.getAll().then((res) => {
            if (res.data && res.data.rCode === 1) {
                setProducts(res.data.rData || []);
            }
        }).catch(err => console.error(err)).finally(() => setLoadingProducts(false));
    }, []);

    // Đóng dropdown khi click ngoài
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setSearchQuery('');
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const addToCart = (product: Product) => {
        const query = searchQuery.toLowerCase().trim();
        const matchedUnit = product.product_units?.find(u => u.unitSku?.toLowerCase() === query);
        const baseUnit = product.product_units?.find(u => u.isBaseUnit);
        const targetUnitId = matchedUnit ? matchedUnit.idProductUnit : (baseUnit?.idProductUnit || "base");

        const existingItem = cart.find(item => item.idProduct === product.idProduct && item.idProductUnit === targetUnitId);

        if (existingItem) {
            setCart(cart.map(item =>
                (item.idProduct === product.idProduct && item.idProductUnit === targetUnitId)
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            const currentUnit = product.product_units?.find(u => u.idProductUnit === targetUnitId);
            const finalUnitName = currentUnit?.unit_detail?.unitName || currentUnit?.unitName || "Đơn vị gốc";
            const finalPrice = currentUnit ? Number(currentUnit.unitPrice) : Number(product.basePrice || 0);

            setCart([...cart, {
                idProduct: product.idProduct,
                nameProduct: product.nameProduct,
                idProductUnit: targetUnitId,
                unitName: finalUnitName,
                quantity: 1,
                unitPrice: finalPrice,
                allUnits: product.product_units || []
            }]);
        }
        setSearchQuery('');
    };

    const handleUnitChange = (cartIndex: number, unitId: string) => {
        setCart(cart.map((item, index) => {
            if (index !== cartIndex) return item;
            const selectedUnit = item.allUnits.find((u: ProductUnit) => u.idProductUnit === unitId);
            if (!selectedUnit) return item;
            return {
                ...item,
                idProductUnit: selectedUnit.idProductUnit,
                unitName: selectedUnit.unit_detail?.unitName || selectedUnit.unitName || "Quy cách",
                unitPrice: Number(selectedUnit.unitPrice || 0)
            };
        }));
    };

    const updateQuantity = (index: number, value: number) => {
        if (value <= 0) return;
        setCart(cart.map((item, idx) => idx === index ? { ...item, quantity: value } : item));
    };

    const removeFromCart = (index: number) => {
        setCart(cart.filter((_, idx) => idx !== index));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsSubmitting(true);
        try {
            const payload = {
                note: "Bán tại quầy",
                items: cart.map(item => ({
                    idProduct: item.idProduct,
                    idProductUnit: item.idProductUnit,
                    quantity: Number(item.quantity),
                    unitPrice: Number(item.unitPrice)
                }))
            };
            const res = await salesService.createInvoice(payload);
            if (res.rCode === 1) {
                alert("Thanh toán thành công!");
                setCart([]);
                router.push('/sales-management');
            } else {
                alert("Lỗi: " + res.rMsg);
            }
        } catch (error: any) {
            alert(error.message || "Lỗi máy chủ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = searchQuery.trim() === '' ? [] : products.filter(p => {
        const query = searchQuery.toLowerCase();
        return p.nameProduct.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query) || p.product_units?.some(u => u.unitSku?.toLowerCase().includes(query));
    });

    return (
        <div className="flex flex-col h-screen bg-gray-100 text-gray-800 text-xs font-sans overflow-hidden select-none">

            {/* THANH ĐIỀU HƯỚNG PANEL */}
            <div className="flex justify-between items-center bg-white px-3 py-1 border-b border-gray-200 shrink-0 shadow-sm">
                <Link href="/" className="text-gray-500 hover:text-indigo-600 font-medium transition-colors">
                    ← Trang chủ
                </Link>
                <h1 className="text-[11px] font-black text-indigo-700 tracking-tight uppercase">POS BÁN HÀNG</h1>
                <Link href="/sales/sales-management" className="bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold px-2 py-0.5 rounded text-[10px]">
                    📋 Lịch sử
                </Link>
            </div>

            {/* THÂN MÀN HÌNH CHIA ĐÔI */}
            <div className="flex flex-1 overflow-hidden">

                {/* CỘT TRÁI: GIỎ HÀNG THU GỌN CHIỀU CAO DÒNG */}
                <div className="flex-1 flex flex-col p-1.5 overflow-hidden border-r border-gray-200">
                    <div ref={searchRef} className="bg-white p-1.5 rounded border border-gray-200 mb-1.5 relative shrink-0">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={loadingProducts ? "Đang đồng bộ..." : "Quét mã vạch hoặc nhập tên..."}
                                disabled={loadingProducts}
                                className="w-full pl-2 pr-12 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <span className="absolute right-2 top-1 text-[9px] font-mono font-bold bg-gray-100 text-gray-400 px-1 rounded border">SCAN</span>
                        </div>

                        {filteredProducts.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 max-h-40 overflow-y-auto border border-gray-200 rounded bg-white shadow-lg z-50 divide-y divide-gray-100">
                                {filteredProducts.map(product => (
                                    <div key={product.idProduct} onClick={() => addToCart(product)} className="p-1.5 flex justify-between items-center hover:bg-emerald-50 cursor-pointer text-[11px]">
                                        <span className="font-bold text-gray-900 truncate">{product.nameProduct}</span>
                                        <span className="font-bold text-emerald-600 shrink-0">{Number(product.basePrice).toLocaleString()}đ</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 bg-white rounded border border-gray-200 overflow-y-auto p-1.5">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-0.5 mb-1 text-[10px] text-gray-500 font-bold">
                            <span>DANH SÁCH MẶT HÀNG</span>
                            <span>{cart.length} DÒNG</span>
                        </div>

                        {cart.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-gray-400 italic py-10">Trống. Quét sản phẩm để tính tiền.</div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {cart.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between py-1 gap-1.5 hover:bg-gray-50 text-[11px]">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-gray-800 truncate">{item.nameProduct}</p>
                                        </div>
                                        <div className="w-24 shrink-0">
                                            <select
                                                className="w-full bg-white border border-gray-300 rounded px-1 py-0.5 text-indigo-700 text-[10px] font-bold outline-none"
                                                value={item.idProductUnit}
                                                onChange={(e) => handleUnitChange(index, e.target.value)}
                                            >
                                                {item.allUnits?.map((u: ProductUnit) => (
                                                    <option key={u.idProductUnit} value={u.idProductUnit}>
                                                        {u.unit_detail?.unitName || u.unitName} (x{Number(u.conversionFactor)})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-0.5 shrink-0">
                                            <button onClick={() => updateQuantity(index, item.quantity - 1)} className="w-4 h-4 bg-white border border-gray-300 rounded text-[10px] font-bold">-</button>
                                            <input type="number" className="w-7 text-center border border-gray-300 rounded py-0 text-[10px] font-bold" value={item.quantity} onChange={(e) => updateQuantity(index, Number(e.target.value))} />
                                            <button onClick={() => updateQuantity(index, item.quantity + 1)} className="w-4 h-4 bg-white border border-gray-300 rounded text-[10px] font-bold">+</button>
                                        </div>
                                        <div className="w-16 text-right font-bold text-gray-900 shrink-0">{(item.quantity * item.unitPrice).toLocaleString()}đ</div>
                                        <button onClick={() => removeFromCart(index)} className="text-gray-400 hover:text-red-500 font-bold px-0.5">&times;</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ⚡ CỘT PHẢI: CHI TIẾT HÓA ĐƠN ĐÃ ĐƯỢC THU GỌN CHIỀU CAO (HEIGHT) TỐI ĐA ⚡ */}
                <div className="w-64 bg-white border-l border-gray-200 p-2 flex flex-col justify-between shrink-0 h-full">

                    {/* KHỐI TRÊN: THÔNG TIN GIAO DỊCH */}
                    <div className="space-y-1.5">
                        <div className="border-b border-gray-100 pb-1">
                            <h2 className="font-bold text-emerald-800 uppercase text-[11px] tracking-tight">Hóa đơn tính tiền</h2>
                        </div>

                        <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Thu ngân:</span>
                                <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                                    {sellerName}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Hình thức:</span>
                                <span className="font-bold text-zinc-700 text-[10px]">Tiền mặt / QR</span>
                            </div>
                        </div>
                    </div>

                    {/* KHỐI DƯỚI: TỔNG TIỀN & NÚT BẤM CỰC KỲ GỌN */}
                    <div className="border-t border-gray-100 pt-1.5 space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500 font-bold text-[10px] uppercase">Tổng trả:</span>
                            <span className="text-base font-black text-emerald-600">
                                {totalAmount.toLocaleString()} đ
                            </span>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isSubmitting || cart.length === 0}
                            className={`w-full py-1.5 text-white rounded font-bold text-center text-xs transition-all shadow-sm ${cart.length === 0
                                    ? 'bg-gray-300 cursor-not-allowed shadow-none'
                                    : 'bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98]'
                                }`}
                        >
                            {isSubmitting ? "ĐANG LƯU..." : "HOÀN THÀNH & IN BILL"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}