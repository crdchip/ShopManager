"use client";

import React, { useState, useEffect } from "react";
import {
    Plus, Pencil, Trash2, MoreHorizontal,
    UserCheck, UserX, Loader2, RefreshCw, Shield
} from "lucide-react";
import { userService } from "@/services/user.service";
import { roleService } from "@/services/roles.service";
import { Button } from "@/components/ui/button";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox"; // Sử dụng checkbox của shadcn/ui

// Interface cho Role lấy từ backend trả về kèm trong User
interface UserRole {
    idRole: string;
    roleName: string;
    description?: string;
}

// Interface đại diện cho danh sách tất cả các Role hệ thống
interface SystemRole {
    idRole: string;
    roleName: string;
    description?: string | null; // Cho phép nhận cả null từ DB trả về
}

interface User {
    idUsers: string;
    userName: string;
    fullName: string;
    phone?: string;
    isActive: boolean;
    createAt: string;
    roles: UserRole[]; // Nhận thêm danh sách roles từ Backend trả về
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [systemRoles, setSystemRoles] = useState<SystemRole[]>([]); // Khai báo state lưu danh sách tất cả vai trò
    const [isLoading, setIsLoading] = useState(true);

    // State cho Modal Thêm/Sửa
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState({
        username: "",
        full_name: "",
        password: "",
        phone: "",
        roles: [] as string[] // Mảng chứa danh sách các idRole được chọn
    });

    // --- 1. HÀM FETCH DỮ LIỆU USERS & ROLES (GET) ---
    const loadData = async () => {
        try {
            setIsLoading(true);
            setUsers([]); // Reset data cũ nếu có

            // 1. Gọi API Users trước (Đảm bảo chạy độc lập)
            try {
                const usersRes = await userService.getUsers();
                if (usersRes.data && usersRes.data.rCode === 1) {
                    setUsers(usersRes.data.rData);
                } else {
                    console.error("Backend trả về lỗi tải users:", usersRes.data?.rMsg);
                }
            } catch (userErr) {
                console.error("Lỗi kết nối API Users:", userErr);
            }

            // 2. Gọi API Roles riêng biệt, lỗi không ảnh hưởng đến Users
            try {
                const rolesRes = await roleService.getAll();
                if (rolesRes.data && rolesRes.data.rCode === 1) {
                    setSystemRoles(rolesRes.data.rData);
                } else {
                    console.error("Backend trả về lỗi tải roles:", rolesRes.data?.rMsg);
                }
            } catch (roleErr) {
                console.error("Lỗi kết nối API Roles (Có thể chưa bật server hoặc sai endpoint):", roleErr);
                setSystemRoles([]); // Fallback mảng rỗng để không lỗi giao diện
            }

        } catch (error) {
            console.error("Lỗi tổng hợp tại loadData:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // --- 2. HÀM LƯU DỮ LIỆU (POST / PUT) ---
    const handleSave = async () => {
        // Cấu trúc payload chuẩn khít theo Schema backend mới (chứa mảng chuỗi roles)
        const dataToBackend = {
            userName: formData.username,
            fullName: formData.full_name,
            password: formData.password || undefined, // Nếu sửa đổi không nhập pass thì bỏ trống hoặc loại bỏ
            phone: formData.phone || null,
            roles: formData.roles // Gửi mảng chuỗi ["id-role-1", "id-role-2"]
        };

        // Nếu đang chỉnh sửa và người dùng không nhập gì vào trường password, xóa hẳn khỏi payload để tránh ghi đè pass cũ thành hash rỗng
        if (editingUser && !formData.password) {
            delete dataToBackend.password;
        }

        try {
            if (editingUser) {
                await userService.updateUser(editingUser.idUsers, dataToBackend);
            } else {
                await userService.createUser(dataToBackend);
            }

            alert("Lưu thông tin tài khoản thành công!");
            setIsModalOpen(false);
            loadData(); // Tải lại danh sách

        } catch (error: any) {
            if (error.response) {
                const errorData = error.response.data;
                const message = typeof errorData.detail === 'string'
                    ? errorData.detail
                    : errorData.detail?.[0]?.msg || "Lỗi không xác định";

                alert("Thất bại: " + message);
            } else {
                alert("Lỗi kết nối server!");
            }
        }
    };

    // --- 3. HÀM XÓA / ĐỔI TRẠNG THÁI (DELETE) ---
    const handleDelete = async (id: string, isActive: boolean) => {
        if (confirm(`Bạn có chắc chắn muốn ${isActive ? "khoá" : "mở khoá"} tài khoản này?`)) {
            try {
                await userService.deleteUser(id);
                loadData();
            } catch (error) {
                alert("Lỗi khi thay đổi trạng thái người dùng!");
            }
        }
    };

    // --- 4. HÀM XỬ LÝ CHỌN / BỎ CHỌN CHECKBOX ROLE ---
    const handleRoleCheckboxChange = (roleId: string, checked: boolean) => {
        if (checked) {
            setFormData(prev => ({ ...prev, roles: [...prev.roles, roleId] }));
        } else {
            setFormData(prev => ({ ...prev, roles: prev.roles.filter(id => id !== roleId) }));
        }
    };

    // Mở Modal và nạp dữ liệu cũ bao gồm cả các Role hiện tại của User đó
    const openModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                username: user.userName,
                full_name: user.fullName,
                password: "", // Không hiển thị mật khẩu cũ
                phone: user?.phone || "",
                // Lấy ra danh sách chuỗi ID các vai trò mà user này đang có để tích chọn sẵn trên UI
                roles: user.roles ? user.roles.map(r => r.idRole) : []
            });
        } else {
            setEditingUser(null);
            setFormData({
                username: "",
                full_name: "",
                password: "",
                phone: "",
                roles: [] // Mới tinh thì để mảng rỗng
            });
        }
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý Người dùng</h1>
                    <p className="text-zinc-500 text-sm">Danh sách tài khoản hệ thống kèm phân quyền cấu trúc.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={loadData} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                    <Button onClick={() => openModal()} className="gap-2">
                        <Plus className="w-4 h-4" /> Thêm người dùng
                    </Button>
                </div>
            </div>

            {/* Bảng Dữ liệu */}
            <Card className="shadow-sm">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="h-64 flex flex-col items-center justify-center gap-2 text-zinc-500">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p>Đang tải dữ liệu từ máy chủ...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-zinc-50">
                                <TableRow>
                                    <TableHead className="font-bold text-zinc-950">Username</TableHead>
                                    <TableHead className="font-bold text-zinc-950">Họ và tên</TableHead>
                                    <TableHead className="font-bold text-zinc-950">Vai trò (Role)</TableHead>
                                    <TableHead className="font-bold text-zinc-950">SĐT</TableHead>
                                    <TableHead className="font-bold text-zinc-950">Trạng thái</TableHead>
                                    <TableHead className="text-right font-bold text-zinc-950">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.length > 0 ? users.map((user) => (
                                    <TableRow key={user.idUsers} className="hover:bg-zinc-50/50 transition-colors">
                                        <TableCell className="font-medium">@{user.userName}</TableCell>
                                        <TableCell>{user.fullName}</TableCell>
                                        {/* HIỂN THỊ DANH SÁCH BADGE VAI TRÒ CỦA USER */}
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {user.roles && user.roles.length > 0 ? (
                                                    user.roles.map((r) => (
                                                        <Badge key={r.idRole} variant="secondary" className="gap-1 bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                                                            <Shield className="w-3 h-3" />
                                                            {r.roleName}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-zinc-400">Chưa gán vai trò</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{user.phone || "—"}</TableCell>
                                        <TableCell>
                                            <Badge className={user.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" : "bg-zinc-100 text-zinc-600 border-none"}>
                                                {user.isActive ? <UserCheck className="w-3 h-3 mr-1 inline" /> : <UserX className="w-3 h-3 mr-1 inline" />}
                                                {user.isActive ? "Hoạt động" : "Bị khóa"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-40">
                                                    <DropdownMenuLabel>Hành động</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => openModal(user)}>
                                                        <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(user.idUsers, user.isActive)} className={user.isActive ? "text-red-600" : "text-green-600"}>
                                                        {user.isActive ? <UserX className="mr-2 h-4 w-4" /> : <UserCheck className="mr-2 h-4 w-4" />} {user.isActive ? "Khoá tài khoản" : "Mở khoá tài khoản"}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                            Chưa có người dùng nào. Hãy thêm mới!
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* MODAL THÊM/SỬA */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[480px]"> {/* Sửa lại max-w lỗi chính tả pixel của bạn ban đầu */}
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Cập nhật tài khoản" : "Tạo tài khoản mới"}</DialogTitle>
                        <DialogDescription>Nhập thông tin và lựa chọn phân quyền theo cấu trúc Shop Manager.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-1">
                        <div className="grid gap-2">
                            <Label htmlFor="username">Tên đăng nhập (username)</Label>
                            <Input
                                id="username"
                                disabled={!!editingUser} // Thường không nên cho sửa userName sau khi tạo
                                placeholder="Ví dụ: bao_mobile"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="full_name">Họ và tên đầy đủ</Label>
                            <Input
                                id="full_name"
                                placeholder="Ví dụ: Nguyễn Văn Bảo"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Mật khẩu {editingUser && <span className="text-xs text-zinc-400">(Để trống nếu giữ nguyên)</span>}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={editingUser ? "••••••••" : "Nhập mật khẩu ít nhất 6 ký tự"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="phone">Số điện thoại</Label>
                            <Input
                                id="phone"
                                type="text"
                                placeholder="Ví dụ: 0912345678"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>

                        {/* --- KHU VỰC CHỌN VAI TRÒ (ROLES MULTI-SELECT CHECKBOX) --- */}
                        <div className="grid gap-2 mt-2">
                            <Label className="text-zinc-950 font-semibold">Gán vai trò hệ thống (Roles)</Label>
                            <div className="border rounded-lg p-3 space-y-3 bg-zinc-50/50 max-h-36 overflow-y-auto">
                                {systemRoles.length > 0 ? systemRoles.map((role) => (
                                    <div key={role.idRole} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role.idRole}`}
                                            checked={formData.roles.includes(role.idRole)}
                                            onCheckedChange={(checked) => handleRoleCheckboxChange(role.idRole, !!checked)}
                                        />
                                        <label
                                            htmlFor={`role-${role.idRole}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex flex-col gap-0.5"
                                        >
                                            <span>{role.roleName}</span>
                                            {role.description && <span className="text-xs text-zinc-400 font-normal">{role.description}</span>}
                                        </label>
                                    </div>
                                )) : (
                                    <p className="text-xs text-zinc-400 italic">Không tìm thấy vai trò nào trong hệ thống.</p>
                                )}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleSave} disabled={!formData.username || !formData.full_name}>
                            {editingUser ? "Lưu thay đổi" : "Tạo người dùng"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}