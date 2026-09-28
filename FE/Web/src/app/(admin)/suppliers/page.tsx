"use client";

import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, MoreHorizontal, Truck, Phone, MapPin, Mail, RefreshCw, UserCheck, UserX } from "lucide-react";
import { supplierService } from "@/services/supplier.service";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Supplier {
    idSuppliers: string;
    nameSuppliers: string;
    phoneSuppliers: string;
    addressSupplie: string;
    emailSupplier: string;
    taxCode: string;
    contactPerson: string;
    bankAccount: string;
    isActive: boolean;
}

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

    // Form data khớp chính xác với SupplierCreate schema của bạn
    const [formData, setFormData] = useState({
        nameSuppliers: "",
        phoneSuppliers: "",
        addressSupplie: "",
        emailSupplier: "",
        taxCode: "",
        contactPerson: "",
        bankAccount: "",
    });

    const loadSuppliers = async () => {
        try {
            setIsLoading(true);
            const res = await supplierService.getAll();
            // Theo cấu trúc API của bạn: res.data.data là mảng kết quả
            setSuppliers(res.data.rData || []);
        } catch (error) {
            console.error("Lỗi tải NCC:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadSuppliers(); }, []);

    const handleOpenModal = (supplier?: Supplier) => {
        if (supplier) {
            setEditingSupplier(supplier);
            setFormData({
                nameSuppliers: supplier.nameSuppliers,
                phoneSuppliers: supplier.phoneSuppliers || "",
                addressSupplie: supplier.addressSupplie || "",
                emailSupplier: supplier.emailSupplier || "",
                taxCode: supplier.taxCode || "",
                contactPerson: supplier.contactPerson || "",
                bankAccount: supplier.bankAccount || "",
            });
        } else {
            setEditingSupplier(null);
            setFormData({ nameSuppliers: "", phoneSuppliers: "", addressSupplie: "", emailSupplier: "", taxCode: "", contactPerson: "", bankAccount: "" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        try {
            const payload = { ...formData, createdBy: "admin-id" }; // createdBy theo schema

            let res;
            if (editingSupplier) {
                res = await supplierService.update(editingSupplier.idSuppliers, formData);
            } else {
                res = await supplierService.create(payload);
            }

            if (res.data.rCode !== 0) {
                setIsModalOpen(false);
                loadSuppliers();
            } else {
                alert(res.data.rMsg);
            }
        } catch (error: any) {
            alert(error.response?.data?.detail || "Có lỗi xảy ra");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Xóa nhà cung cấp này?")) {
            try {
                await supplierService.delete(id);
                loadSuppliers();
            } catch (error) {
                alert("Không thể xóa nhà cung cấp này");
            }
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Nhà cung cấp</h1>
                    <p className="text-zinc-500 text-sm">Quản lý thông tin đối tác nhập hàng.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={loadSuppliers} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="gap-2">
                        <Plus className="w-4 h-4" /> Thêm đối tác
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-zinc-50">
                            <TableRow>
                                <TableHead>Tên nhà cung cấp</TableHead>
                                <TableHead>Liên hệ</TableHead>
                                <TableHead>Địa chỉ</TableHead>
                                <TableHead>Mã số thuế</TableHead>
                                <TableHead>Tài khoản ngân hàng</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers.map((s) => (
                                <TableRow key={s.idSuppliers}>
                                    <TableCell>
                                        <div className="font-semibold text-zinc-900">{s.nameSuppliers}</div>
                                        <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                                            <Truck className="w-3 h-3" /> {s.contactPerson || "N/A"}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm flex items-center gap-2"><Phone className="w-3 h-3 text-zinc-400" /> {s.phoneSuppliers}</div>
                                        <div className="text-sm flex items-center gap-2 mt-1"><Mail className="w-3 h-3 text-zinc-400" /> {s.emailSupplier}</div>
                                    </TableCell>
                                    <TableCell className="max-w-50 truncate text-sm text-zinc-600">
                                        <div className="flex items-start gap-1"><MapPin className="w-3 h-3 mt-1 shrink-0" /> {s.addressSupplie}</div>
                                    </TableCell>
                                    <TableCell><Badge variant="secondary">{s.taxCode || "---"}</Badge></TableCell>
                                    <TableCell><Badge variant="secondary">{s.bankAccount || "---"}</Badge></TableCell>
                                    <TableCell>
                                        <Badge className={s.isActive ? "bg-green-100 text-green-700 hover:bg-green-100 border-none" : "bg-zinc-100 text-zinc-600 border-none"}>
                                            {s.isActive ? <UserCheck className="w-3 h-3 mr-1 inline" /> : <UserX className="w-3 h-3 mr-1 inline" />}
                                            {s.isActive ? "Hoạt động" : "Bị khóa"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenModal(s)}><Pencil className="mr-2 h-4 w-4" /> Sửa</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(s.idSuppliers)} className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Xóa</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-150px">
                    <DialogHeader>
                        <DialogTitle>{editingSupplier ? "Cập nhật đối tác" : "Thêm nhà cung cấp mới"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4 py-4">
                        <div className="col-span-2 space-y-2">
                            <Label>Tên nhà cung cấp *</Label>
                            <Input value={formData.nameSuppliers} onChange={(e) => setFormData({ ...formData, nameSuppliers: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Số điện thoại</Label>
                            <Input value={formData.phoneSuppliers} onChange={(e) => setFormData({ ...formData, phoneSuppliers: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={formData.emailSupplier} onChange={(e) => setFormData({ ...formData, emailSupplier: e.target.value })} />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Địa chỉ</Label>
                            <Input value={formData.addressSupplie} onChange={(e) => setFormData({ ...formData, addressSupplie: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Mã số thuế</Label>
                            <Input value={formData.taxCode} onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Người liên hệ</Label>
                            <Input value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label>Tài khoản ngân hàng</Label>
                            <Input value={formData.bankAccount} placeholder="Số tài khoản - Ngân hàng" onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button onClick={handleSave}>Lưu thông tin</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}