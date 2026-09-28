"use html";
"use client";

import React, { useState, useEffect } from "react";
import {
    KeyRound, Plus, Pencil, Trash2,
    RefreshCw, Search, Layers
} from "lucide-react";
import { permissionService, Permission } from "@/services/permissions.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const AVAILABLE_MODULES = [
    { value: "users", label: "Người dùng (Users)" },
    { value: "products", label: "Sản phẩm (Products)" },
    { value: "categories", label: "Danh mục (Categories)" },
    { value: "suppliers", label: "Nhà cung cấp (Suppliers)" },
    { value: "units", label: "Đơn vị tính (Units)" },
    { value: "orders", label: "Đơn hàng (Orders)" },
];

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedModule, setSelectedModule] = useState<string>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<Permission | null>(null);

    // Form data chuẩn hóa theo DB Permissions
    const [formData, setFormData] = useState({
        permKey: "",
        permName: "",
        module: "",
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await permissionService.getAll();
            if (res.data && res.data.rCode === 1) {
                setPermissions(res.data.rData || []);
            }
        } catch (error) {
            console.error("Lỗi tải danh sách quyền hạn:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Lọc ra danh sách duy nhất các module chức năng để làm bộ lọc nhanh (Filter Tabs)
    const uniqueModules = Array.from(new Set(permissions.map(p => p.module))).filter(Boolean);

    const handleOpenModal = (perm?: Permission) => {
        if (perm) {
            setEditingPermission(perm);
            setFormData({
                permKey: perm.permKey,
                permName: perm.permName,
                module: perm.module
            });
        } else {
            setEditingPermission(null);
            setFormData({ permKey: "", permName: "", module: "" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.permKey.trim() || !formData.permName.trim() || !formData.module.trim()) {
            alert("Vui lòng nhập đầy đủ các trường bắt buộc (*)");
            return;
        }

        try {
            const payload = {
                permKey: formData.permKey.trim(),
                permName: formData.permName.trim(),
                module: formData.module.trim().toLowerCase(), // Chuẩn hóa chữ thường cho module
                createdBy: "admin"
            };

            if (editingPermission) {
                // Khi update, backend chỉ xử lý update tên hiển thị và module
                await permissionService.update(editingPermission.idPermission, payload);
            } else {
                const res = await permissionService.create(payload);
                if (res.data.rCode === 0) {
                    alert(res.data.rMsg);
                    return;
                }
            }
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            const serverError = error.response?.data?.detail || "Lỗi thao tác chức năng";
            alert(typeof serverError === "string" ? serverError : JSON.stringify(serverError));
        }
    };

    const handleDelete = async (id: string, key: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn mã quyền "${key}" khỏi hệ thống?`)) return;
        try {
            const res = await permissionService.delete(id);
            if (res.data.rCode === 1) {
                loadData();
            } else {
                alert(res.data.rMsg);
            }
        } catch (error: any) {
            alert(error.response?.data?.detail || "Không thể xóa quyền hạn này");
        }
    };

    // Logic tìm kiếm kết hợp lọc theo Module chức năng
    const filteredPermissions = permissions.filter(p => {
        const matchesSearch =
            p.permName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.permKey.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesModule = selectedModule === "all" || p.module === selectedModule;

        return matchesSearch && matchesModule;
    });

    return (
        <div className="p-8 space-y-6">
            {/* Header điều hướng */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <KeyRound className="text-emerald-600" /> Quản lý quyền hạn (Permissions)
                    </h1>
                    <p className="text-zinc-500 text-sm">Định nghĩa các mã quyền cốt lõi hệ thống ứng dụng để liên kết cấu trúc vai trò.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Plus className="w-4 h-4 mr-2" /> Thêm quyền hệ thống
                </Button>
            </div>

            {/* Thanh bộ lọc nhanh Module */}
            <div className="flex flex-wrap gap-2 items-center">
                <Button
                    variant={selectedModule === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedModule("all")}
                    className={selectedModule === "all" ? "bg-zinc-900 text-white" : ""}
                >
                    Tất cả quyền
                </Button>
                {uniqueModules.map((mod) => (
                    <Button
                        key={mod}
                        variant={selectedModule === mod ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedModule(mod)}
                        className={selectedModule === mod ? "bg-emerald-600 text-white hover:bg-emerald-700" : "capitalize"}
                    >
                        <Layers className="w-3.5 h-3.5 mr-1" /> {mod}
                    </Button>
                ))}
            </div>

            {/* Bảng Dữ Liệu */}
            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Tìm mã quyền (permKey), tên hiển thị..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon" onClick={loadData}>
                            <RefreshCw className={`w-4 h-4 ${loading && "animate-spin"}`} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã định danh (permKey)</TableHead>
                                <TableHead>Tên mô tả quyền (permName)</TableHead>
                                <TableHead>Module chức năng</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-10 text-zinc-400">Đang đồng bộ quyền từ database...</TableCell></TableRow>
                            ) : filteredPermissions.length === 0 ? (
                                <TableRow><TableCell colSpan={4} className="text-center py-10 text-zinc-500">Không tìm thấy mã quyền hạn phù hợp</TableCell></TableRow>
                            ) : filteredPermissions.map((perm) => (
                                <TableRow key={perm.idPermission}>
                                    <TableCell className="font-mono text-sm text-emerald-700 font-semibold">
                                        {perm.permKey}
                                    </TableCell>
                                    <TableCell className="font-medium text-zinc-800">{perm.permName}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 uppercase text-[11px]">
                                            {perm.module}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(perm)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(perm.idPermission, perm.permKey)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Dialog Thêm/Sửa Cấu Hình */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingPermission ? "Cập nhật chi tiết quyền" : "Định nghĩa quyền hạn mới"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Mã key hệ thống (permKey) <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="VD: product_create, user_delete..."
                                value={formData.permKey}
                                disabled={!!editingPermission} // Khóa không cho sửa permKey khi cập nhật để tránh gãy logic phân quyền cũ
                                onChange={(e) => setFormData({ ...formData, permKey: e.target.value })}
                            />
                            {editingPermission && (
                                <p className="text-[11px] text-amber-600 italic">Lưu ý: Không được phép thay đổi mã Key hệ thống định danh chính.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Tên quyền hiển thị (permName) <span className="text-red-500">*</span></Label>
                            <Input
                                placeholder="VD: Thêm mới sản phẩm, Xóa tài khoản..."
                                value={formData.permName}
                                onChange={(e) => setFormData({ ...formData, permName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Thuộc Module quản lý <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.module}
                                onValueChange={(value) => setFormData({ ...formData, module: value })}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Chọn module chức năng quản lý..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {AVAILABLE_MODULES.map((mod) => (
                                        <SelectItem key={mod.value} value={mod.value}>
                                            {mod.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* PHẦN THÔNG TIN THỜI GIAN DB (ẨN KHI TẠO MỚI - CHỈ XEM KHI EDIT) */}
                        {editingPermission && (
                            <div className="mt-4 pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2 text-xs text-zinc-400 font-mono">
                                <div>Người tạo: <span className="text-zinc-600 font-sans">{editingPermission.createdBy || "Hệ thống"}</span></div>
                                <div className="text-right">Ngày tạo: {editingPermission.createdAt ? new Date(editingPermission.createdAt).toLocaleDateString("vi-VN") : "---"}</div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy bỏ</Button>
                        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white">Lưu cấu hình</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}