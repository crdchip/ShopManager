"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Pencil, Package, RefreshCw, FileUp } from "lucide-react";
import { productService, Product } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { unitService, Unit } from "@/services/unit.service";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cờ hiệu ngăn chặn StrictMode gọi trùng API 2 lần khi mount component dưới môi trường Dev
    const isFetched = useRef(false);

    const [formData, setFormData] = useState<any>({
        nameProduct: "", sku: "", idCategory: "", description: "",
        minStock: 0, currentStock: 0, imageProduct: "",
        product_units: []
    });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [resP, resU, resC] = await Promise.all([
                productService.getAll().catch(err => { console.error("Lỗi Products:", err); return null; }),
                unitService.getAll().catch(err => { console.error("Lỗi Units:", err); return null; }),
                categoryService.getAll().catch(err => { console.error("Lỗi Categories:", err); return null; })
            ]);
            if (resP && resP.data?.rCode === 1) setProducts(resP.data.rData);
            if (resU && resU.data?.rCode === 1) setUnits(resU.data.rData);
            if (resC && resC.data?.rCode === 1) setCategories(resC.data.rData);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Quản lý nạp dữ liệu chuẩn React 18, bypass StrictMode gọi double-fetch
    useEffect(() => {
        if (isFetched.current) return;

        loadData();

        isFetched.current = true;
    }, []);

    const handleRefreshData = () => {
        loadData();
    };

    const handleAddUnit = () => {
        setFormData({
            ...formData,
            product_units: [...formData.product_units, { idUnit: "", unitSku: "", conversionFactor: 1, unitPrice: 0, purchasePrice: 0, isBaseUnit: false, description: "" }]
        });
    };

    const handleSave = async () => {
        // Validation cơ bản trước khi đẩy data lên API
        if (!formData.nameProduct.trim()) {
            alert("Vui lòng điền Tên sản phẩm.");
            return;
        }
        if (!formData.idCategory) {
            alert("Vui lòng chọn Danh mục sản phẩm.");
            return;
        }

        // Kiểm tra validation cho từng quy cách đơn vị phụ thuộc nếu có
        for (let i = 0; i < formData.product_units.length; i++) {
            const u = formData.product_units[i];
            if (!u.unitSku.trim()) {
                alert(`Quy cách số #${i + 1}: Vui lòng nhập Mã SKU Đơn vị.`);
                return;
            }
            if (u.conversionFactor <= 0) {
                alert(`Quy cách số #${i + 1}: Hệ số quy đổi phải lớn hơn 0.`);
                return;
            }
        }

        const finalSku = formData.sku || `SP-${Date.now()}`;
        const payload = {
            nameProduct: formData.nameProduct,
            sku: finalSku,
            idCategory: formData.idCategory || null,
            description: formData.description,
            currentStock: formData.currentStock,
            minStock: formData.minStock,
            imageProduct: formData.imageProduct,
            unitsData: formData.product_units.map((u: any) => ({
                idUnit: u.idUnit,
                unitSku: u.unitSku,
                conversionFactor: u.conversionFactor,
                unitPrice: u.unitPrice,
                purchasePrice: u.purchasePrice,
                isBaseUnit: u.isBaseUnit,
                description: u.description || ""
            }))
        };

        try {
            setIsLoading(true);
            if (editingId) {
                await productService.update(editingId, payload);
            } else {
                await productService.create(payload);
            }

            setIsModalOpen(false);
            setEditingId(null);
            setFormData({ nameProduct: "", sku: "", idCategory: "", description: "", minStock: 0, currentStock: 0, imageProduct: "", product_units: [] });
            loadData();
        } catch (error) {
            console.error("Lỗi khi lưu sản phẩm:", error);
            alert("Có lỗi xảy ra khi lưu thông tin sản phẩm.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (product?: Product) => {
        if (product) {
            setEditingId(product.idProduct);
            setFormData({
                nameProduct: product.nameProduct,
                sku: product.sku,
                idCategory: product.idCategory || "",
                description: product.description || "",
                minStock: product.minStock,
                currentStock: product.currentStock,
                imageProduct: product.imageProduct || "",
                product_units: product.product_units || []
            });
        } else {
            setEditingId(null);
            setFormData({
                nameProduct: "", sku: "", idCategory: "",
                description: "", minStock: 0, currentStock: 0, imageProduct: "",
                product_units: []
            });
        }
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
            try {
                setIsLoading(true);
                await productService.delete(id);
                loadData();
            } catch (error) {
                console.error("Lỗi khi xóa sản phẩm:", error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        setIsLoading(true);
        try {
            const res = await productService.importExcel(file);
            if (res.data && res.data.rCode === 1) {
                alert(res.data.rMsg || "Nhập danh sách sản phẩm từ Excel thành công!");
                if (res.data.rData?.errors?.length > 0) {
                    console.warn("Các dòng lỗi chi tiết:", res.data.rData.errors);
                    alert("Có một số dòng sản phẩm bị lỗi cấu trúc, vui lòng kiểm tra F12 Console.");
                }
            } else {
                alert("Lỗi xử lý file: " + res.data.rMsg);
            }
            loadData();
        } catch (error: any) {
            console.error("Lỗi Import:", error);
            alert(error.response?.data?.detail || "Không thể tải tệp lên, vui lòng kiểm tra lại cấu trúc hàng cột.");
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDownloadTemplate = async () => {
        try {
            setIsLoading(true);
            const response = await productService.downloadTemplate();

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "template_import_products.xlsx");
            document.body.appendChild(link);
            link.click();

            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Lỗi khi tải file template mẫu:", error);
            alert("Không thể tải file mẫu lúc này, vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    const updateUnit = (index: number, field: string, value: any) => {
        const newUnits = [...formData.product_units];
        newUnits[index] = { ...newUnits[index], [field]: value };
        setFormData({ ...formData, product_units: newUnits });
    };

    const removeUnit = (index: number) => {
        setFormData({ ...formData, product_units: formData.product_units.filter((_: any, i: number) => i !== index) });
    };

    return (
        <div className="p-8 space-y-6">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImportExcel}
                accept=".xlsx, .xls"
                className="hidden"
            />

            {/* Header Control Panel */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="text-orange-500" /> Quản lý sản phẩm
                </h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleRefreshData} disabled={isLoading} className="border-orange-200 text-orange-600">
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleDownloadTemplate}
                        disabled={isLoading}
                        className="border-zinc-300 text-zinc-600 hover:bg-zinc-50 font-semibold"
                    >
                        Tải Template Mẫu
                    </Button>

                    <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="border-zinc-300 text-zinc-700 hover:bg-zinc-50 font-semibold"
                    >
                        <FileUp className="mr-2 h-4 w-4 text-emerald-600" /> Import Excel
                    </Button>

                    <Button onClick={() => handleOpenModal()} className="bg-orange-600 hover:bg-orange-700">
                        <Plus className="mr-2 h-4 w-4" /> Thêm sản phẩm
                    </Button>
                </div>
            </div>

            {/* Danh sách Table Sản Phẩm */}
            <div className={`transition-opacity duration-300 ${isLoading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Hình ảnh</TableHead>
                            <TableHead>Tên sản phẩm</TableHead>
                            <TableHead>Quy cách & Mô tả</TableHead>
                            <TableHead>Tồn kho</TableHead>
                            <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                                    Không tìm thấy sản phẩm nào hệ thống.
                                </TableCell>
                            </TableRow>
                        ) : (
                            products.map(p => (
                                <TableRow key={p.idProduct}>
                                    <TableCell>
                                        <div className="w-12 h-12 rounded-lg bg-gray-100 border flex items-center justify-center overflow-hidden">
                                            {p.imageProduct ? (
                                                <img src={p.imageProduct} className="w-full h-full object-cover" alt={p.nameProduct} />
                                            ) : (
                                                <Package className="text-gray-400 w-6 h-6" />
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-semibold">
                                        {p.nameProduct}
                                        <div className="text-xs text-gray-400 font-normal">SKU: {p.sku}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-wrap gap-1 mb-1">
                                            {p.product_units?.map((u, i) => (
                                                <Badge key={i} variant={u.isBaseUnit ? "default" : "secondary"} className="text-[10px]">
                                                    {u.unitName}
                                                </Badge>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 italic max-w-62.5px truncate">{p.description || "Không có mô tả"}</p>
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {p.currentStock > 0 ? (
                                            <span className="text-green-600 font-bold">{p.currentStock}</span>
                                        ) : (
                                            <span className="text-red-500 font-bold">Hết hàng</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right flex gap-2 justify-end">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(p)}>
                                            <Pencil className="h-4 w-4 text-blue-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.idProduct)}>
                                            <Trash2 className="h-4 w-4 text-red-600" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Modal Form Thêm/Sửa thông tin sản phẩm */}
            <Dialog open={isModalOpen} onOpenChange={(open) => {
                setIsModalOpen(open);
                if (!open) setEditingId(null);
            }}>
                <DialogContent className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                            {editingId ? "Cập nhật thông tin sản phẩm" : "Tạo sản phẩm mới"}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Khối thông tin cốt lõi */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">
                                Tên sản phẩm <span className="text-red-500">*</span>
                            </label>
                            <Input placeholder="Nhập tên sản phẩm" value={formData.nameProduct} onChange={(e) => setFormData({ ...formData, nameProduct: e.target.value })} />
                        </div>

                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">
                                Danh mục <span className="text-red-500">*</span>
                            </label>
                            <Select
                                value={formData.idCategory || undefined}
                                onValueChange={(v) => setFormData({ ...formData, idCategory: v === "none" ? "" : v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn danh mục sản phẩm" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map(c => (
                                        <SelectItem key={c.idCategory} value={c.idCategory}>
                                            {c.nameCategory}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Tồn kho hiện tại</label>
                            <Input type="number" value={formData.currentStock} onChange={(e) => setFormData({ ...formData, currentStock: Number(e.target.value) })} />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-500 uppercase">Cảnh báo số lượng (Min)</label>
                            <Input type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })} />
                        </div>

                        <div className="col-span-2 space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Mô tả sản phẩm</label>
                            <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                    </div>

                    {/* Đơn vị tính & Quy cách chuyển đổi chi tiết */}
                    <div className="space-y-4 pt-2">
                        <h3 className="font-semibold text-orange-600">📦 Chi tiết quy cách đơn vị</h3>
                        {formData.product_units.map((u: any, i: number) => (
                            <div key={i} className="border bg-zinc-50 p-5 rounded-xl shadow-sm space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-700 text-sm">Đơn vị #{i + 1}</span>
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={() => removeUnit(i)}>
                                        <Trash2 className="w-4 h-4 mr-2" /> Xóa đơn vị
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Đơn vị tính</label>
                                        <Select value={u.idUnit} onValueChange={(v) => updateUnit(i, "idUnit", v)}>
                                            <SelectTrigger><SelectValue placeholder="Chọn đơn vị" /></SelectTrigger>
                                            <SelectContent>
                                                {units.map(unit => (
                                                    <SelectItem key={unit.idUnit} value={unit.idUnit}>{unit.unitName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">
                                            Mã SKU Đơn vị <span className="text-red-500">*</span>
                                        </label>
                                        <Input placeholder="Mã SKU đơn vị quy đổi" value={u.unitSku} onChange={(e) => updateUnit(i, "unitSku", e.target.value)} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">
                                            Hệ số quy đổi <span className="text-red-500">*</span>
                                        </label>
                                        <Input type="number" min={1} value={u.conversionFactor} onChange={(e) => updateUnit(i, "conversionFactor", Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Giá nhập</label>
                                        <Input type="number" value={u.purchasePrice} onChange={(e) => updateUnit(i, "purchasePrice", Number(e.target.value))} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Giá bán</label>
                                        <Input type="number" value={u.unitPrice} onChange={(e) => updateUnit(i, "unitPrice", Number(e.target.value))} />
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 pt-2">
                                    <input
                                        type="checkbox"
                                        id={`base-${i}`}
                                        checked={u.isBaseUnit}
                                        className="w-4 h-4 rounded border-gray-300 accent-orange-600 focus:ring-orange-500"
                                        onChange={(e) => {
                                            formData.product_units.forEach((_: any, idx: number) => {
                                                if (idx !== i) updateUnit(idx, "isBaseUnit", false);
                                            });
                                            updateUnit(i, "isBaseUnit", e.target.checked);
                                        }}
                                    />
                                    <label htmlFor={`base-${i}`} className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                                        Đặt làm đơn vị cơ sở chính (Base Unit)
                                    </label>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Ghi chú quy cách</label>
                                    <Input placeholder="Ví dụ: Thùng 24 lon..." value={u.description} onChange={(e) => updateUnit(i, "description", e.target.value)} />
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={handleAddUnit} className="w-full border-dashed border-zinc-300 text-zinc-600 hover:bg-zinc-50">
                            <Plus className="w-4 h-4 mr-2" /> Thêm quy cách quy đổi
                        </Button>
                    </div>

                    <Button onClick={handleSave} disabled={isLoading} className="w-full bg-orange-600 hover:bg-orange-700 mt-4">
                        {isLoading ? "Đang xử lý..." : "Lưu thông tin sản phẩm"}
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
}