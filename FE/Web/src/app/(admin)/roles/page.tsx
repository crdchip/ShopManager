"use html";
"use client";

import React, { useState, useEffect } from "react";
import {
    ShieldAlert, Plus, Pencil, Trash2,
    RefreshCw, Search, ShieldCheck
} from "lucide-react";
import { roleService, Role, Permission } from "@/services/roles.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch"; // Import thêm Switch để đổi trạng thái On/Off trực quan

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<Role | null>(null);

    const [formData, setFormData] = useState({
        roleName: "",
        description: "",
        isActive: 1, // Đồng bộ mặc định ban đầu là số 1 (Hoạt động) theo chuẩn TINYINT
    });

    // Quản lý các idPermission được tích chọn
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [resRoles, resPerms] = await Promise.all([
                roleService.getAll(),
                roleService.getAllPermissions().catch(() => null)
            ]);

            if (resRoles.data && resRoles.data.rCode === 1) {
                setRoles(resRoles.data.rData || []);
            }
            if (resPerms && resPerms.data && resPerms.data.rCode === 1) {
                setAllPermissions(resPerms.data.rData || []);
            }
        } catch (error) {
            console.error("Lỗi tải cấu hình dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleOpenModal = (role?: Role) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                roleName: role.roleName,
                description: role.description || "",
                // Dự phòng nếu DB trả về dạng Boolean hoặc số, ép chặt về dạng số 1 hoặc 0 để UI render chính xác
                isActive: role.isActive ? 1 : 0
            });
            const currentPermIds = role.permissions?.map(p => p.idPermission) || [];
            setSelectedPermissions(currentPermIds);
        } else {
            setEditingRole(null);
            setFormData({
                roleName: "",
                description: "",
                isActive: 1
            });
            setSelectedPermissions([]);
        }
        setIsModalOpen(true);
    };

    const handleTogglePermission = (idPermission: string) => {
        setSelectedPermissions(prev =>
            prev.includes(idPermission)
                ? prev.filter(id => id !== idPermission)
                : [...prev, idPermission]
        );
    };

    const handleSave = async () => {
        if (!formData.roleName.trim()) {
            alert("Vui lòng điền tên chức vụ / vai trò!");
            return;
        }

        try {
            const payload = {
                roleName: formData.roleName,
                description: formData.description || null,
                isActive: formData.isActive, // Giá trị truyền đi chuẩn kiểu dữ liệu số nguyên (0 hoặc 1)
                createdBy: "admin",
                permissions: selectedPermissions
            };

            if (editingRole) {
                await roleService.update(editingRole.idRole, payload);
            } else {
                await roleService.create(payload);
            }
            setIsModalOpen(false);
            loadData();
        } catch (error: any) {
            const serverError = error.response?.data?.detail || "Lỗi thao tác dữ liệu chức năng";
            alert(typeof serverError === "string" ? serverError : JSON.stringify(serverError));
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa vai trò "${name}"?`)) return;
        try {
            const res = await roleService.delete(id);
            if (res.data.rCode === 1) {
                loadData();
            } else {
                alert(res.data.rMsg);
            }
        } catch (error: any) {
            alert(error.response?.data?.detail || "Không thể xóa chức vụ này");
        }
    };

    const groupedPermissions = allPermissions.reduce((groups, perm) => {
        const moduleName = perm.module.toUpperCase();
        if (!groups[moduleName]) groups[moduleName] = [];
        groups[moduleName].push(perm);
        return groups;
    }, {} as Record<string, Permission[]>);

    const filteredRoles = roles.filter(r =>
        r.roleName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldAlert className="text-indigo-600" /> Quản lý vai trò & Phân quyền
                    </h1>
                    <p className="text-zinc-500 text-sm">Cấu hình chức vụ danh mục, gán quyền hạn và đồng bộ phân quyền truy cập.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" /> Thêm vai trò
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Tìm tên vai trò chức vụ..."
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
                                <TableHead>Tên vai trò / Chức vụ</TableHead>
                                <TableHead>Mô tả công việc</TableHead>
                                <TableHead>Quyền hạn đang nắm giữ</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Hành động</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-zinc-400">Đang tải cấu trúc...</TableCell></TableRow>
                            ) : filteredRoles.length === 0 ? (
                                <TableRow><TableCell colSpan={5} className="text-center py-10 text-zinc-500">Chưa cấu hình dữ liệu nhóm quyền</TableCell></TableRow>
                            ) : filteredRoles.map((role) => (
                                <TableRow key={role.idRole}>
                                    <TableCell className="font-medium text-indigo-600 min-w-37.5px">{role.roleName}</TableCell>
                                    <TableCell className="text-zinc-500 italic max-w-50px truncate">{role.description || "---"}</TableCell>
                                    <TableCell className="max-w-87.5px">
                                        <div className="flex flex-wrap gap-1">
                                            {role.permissions && role.permissions.length > 0 ? (
                                                role.permissions.map((p) => (
                                                    <Badge key={p.idPermission} variant="outline" className="bg-indigo-50/50 text-indigo-700 border-indigo-100 text-[11px] py-0.5 whitespace-nowrap">
                                                        {p.permName}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-zinc-400 text-xs italic">Chưa cấp quyền</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="w-30px">
                                        <Badge variant={role.isActive ? "default" : "destructive"}>
                                            {role.isActive ? "Đang hoạt động" : "Tạm khóa"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right space-x-2 w-25px">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(role)}>
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => handleDelete(role.idRole, role.roleName)}
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

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="text-indigo-600" />
                            {editingRole ? `Cập nhật vai trò: ${formData.roleName}` : "Tạo cấu hình vai trò mới"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2 border-b pb-4">
                        <div className="grid grid-cols-3 gap-4 items-end">
                            <div className="space-y-2 col-span-2">
                                <Label className="font-semibold">Tên vai trò <span className="text-red-500">*</span></Label>
                                <Input
                                    placeholder="VD: Quản lý tổng, Thu ngân, Nhân viên kho..."
                                    value={formData.roleName}
                                    onChange={(e) => setFormData({ ...formData, roleName: e.target.value })}
                                />
                            </div>

                            {/* --- ĐÃ BỔ SUNG: Vùng bật tắt Trạng thái Active trên giao diện Modal --- */}
                            <div className="flex items-center space-x-3 bg-zinc-50 border p-2.5 rounded-md h-10px justify-between">
                                <Label htmlFor="role-status" className="font-semibold text-zinc-700 cursor-pointer text-xs">
                                    {formData.isActive === 1 ? "Đang hoạt động" : "Tạm khóa nhóm"}
                                </Label>
                                <Switch
                                    id="role-status"
                                    checked={formData.isActive === 1}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked ? 1 : 0 })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold">Mô tả phạm vi chức năng</Label>
                            <Input
                                placeholder="Mô tả tóm tắt trách nhiệm công việc..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* VÙNG CHỌN PHÂN QUYỀN CHI TIẾT */}
                    <div className="space-y-4 py-2">
                        <Label className="text-base font-bold text-zinc-800 flex items-center gap-1.5">
                            📌 Thiết lập danh sách quyền hạn chi tiết
                        </Label>

                        {allPermissions.length === 0 ? (
                            <p className="text-sm text-zinc-400 italic">Không tìm thấy danh mục quyền hạn nào trong hệ thống.</p>
                        ) : (
                            <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-2 border rounded-lg p-4 bg-zinc-50/50">
                                {Object.keys(groupedPermissions).map((moduleName) => (
                                    <div key={moduleName} className="space-y-2 border-b pb-3 last:border-0 last:pb-0">
                                        <h4 className="text-xs font-bold text-indigo-600 tracking-wider uppercase mb-1">
                                            Khối: {moduleName}
                                        </h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {groupedPermissions[moduleName].map((perm) => (
                                                <div key={perm.idPermission} className="flex items-center space-x-2 bg-white p-2 rounded border shadow-sm hover:bg-zinc-50 transition-colors">
                                                    <Checkbox
                                                        id={perm.idPermission}
                                                        checked={selectedPermissions.includes(perm.idPermission)}
                                                        onCheckedChange={() => handleTogglePermission(perm.idPermission)}
                                                    />
                                                    <label
                                                        htmlFor={perm.idPermission}
                                                        className="text-xs font-medium cursor-pointer flex-1 leading-tight select-none"
                                                    >
                                                        {perm.permName}
                                                        <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">{perm.permKey}</span>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-4 pt-2 border-t">
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">Cập nhật</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}