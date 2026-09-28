"use html";
"use client";

import React, { useState, useEffect } from "react";
import { 
  Scale, Plus, Pencil, Trash2, 
  RefreshCw, Search 
} from "lucide-react";
import { unitService, Unit } from "@/services/unit.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox"; // Thêm để quản lý trạng thái kích hoạt

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  // Thêm trạng thái isActive vào cấu trúc Form dữ liệu
  const [formData, setFormData] = useState({
    unitName: "",
    description: "",
    isActive: true,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await unitService.getAll();
      // Axios bọc kết quả trả về trong trường res.data
      if (res.data && res.data.rCode === 1) {
        setUnits(res.data.rData || []);
      }
    } catch (error) {
      console.error("Lỗi tải danh sách đơn vị tính:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleOpenModal = (unit?: Unit) => {
    if (unit) {
      setEditingUnit(unit);
      setFormData({ 
        unitName: unit.unitName, 
        description: unit.description || "",
        isActive: unit.isActive 
      });
    } else {
      setEditingUnit(null);
      setFormData({ unitName: "", description: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formData.unitName.trim()) {
      alert("Vui lòng điền tên đơn vị tính!");
      return;
    }
    
    try {
      // Sửa trường 'createBy' thành 'createdBy' đúng chuẩn cấu trúc cột DB snake/camel của bạn
      const payload = { 
        unitName: formData.unitName,
        description: formData.description || null,
        isActive: formData.isActive,
        createdBy: "admin" 
      };

      if (editingUnit) {
        await unitService.update(editingUnit.idUnit, payload);
      } else {
        await unitService.create(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      // Bắt chính xác cấu trúc mảng lỗi hoặc chuỗi text trả về từ FastAPI HTTPException
      const serverError = error.response?.data?.detail || "Lỗi thao tác hệ thống";
      alert(typeof serverError === "string" ? serverError : JSON.stringify(serverError));
    }
  };

  // Viết thêm hàm xử lý sự kiện kích hoạt Soft Delete
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa đơn vị tính "${name}" (Chuyển trạng thái về Khóa)?`)) return;
    try {
      const res = await unitService.delete(id);
      if (res.data.rCode === 1) {
        loadData();
      } else {
        alert(res.data.rMsg);
      }
    } catch (error: any) {
      alert(error.response?.data?.detail || "Không thể xóa đơn vị này");
    }
  };

  const filteredUnits = units.filter(u => 
    u.unitName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Scale className="text-orange-500" /> Đơn vị tính
          </h1>
          <p className="text-zinc-500 text-sm">Quản lý các đơn vị đo lường (Cái, Kg, Thùng...).</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-orange-600 hover:bg-orange-700">
          <Plus className="w-4 h-4 mr-2" /> Thêm đơn vị
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input 
                placeholder="Tìm tên đơn vị..." 
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
                <TableHead>Tên đơn vị</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Hành động</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-zinc-400">Đang tải...</TableCell></TableRow>
              ) : filteredUnits.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center py-10 text-zinc-500">Không tìm thấy dữ liệu đơn vị tính</TableCell></TableRow>
              ) : filteredUnits.map((unit) => (
                <TableRow key={unit.idUnit}>
                  <TableCell className="font-medium text-blue-600">{unit.unitName}</TableCell>
                  <TableCell className="text-zinc-500 italic">{unit.description || "---"}</TableCell>
                  <TableCell>
                    {/* Sửa lại điều kiện kiểm tra màu sắc Badge theo Boolean */}
                    <Badge variant={unit.isActive ? "default" : "destructive"}>
                      {unit.isActive ? "Hoạt động" : "Khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenModal(unit)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    {/* Gắn sự kiện xóa mềm vào nút bấm */}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(unit.idUnit, unit.unitName)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingUnit ? "Sửa đơn vị" : "Thêm đơn vị tính"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tên đơn vị (unitName) <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="VD: Cái, Kg, Hộp..." 
                value={formData.unitName}
                onChange={(e) => setFormData({...formData, unitName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Mô tả (description)</Label>
              <Input 
                placeholder="Mô tả thêm..." 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            
            {/* Thêm ô kiểm trạng thái hoạt động (Kế thừa từ Shadcn UI Checkbox) */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox 
                id="isActive" 
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: !!checked})}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="isActive"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Kích hoạt sử dụng
                </label>
                <p className="text-xs text-muted-foreground">
                  Cho phép đơn vị hiển thị trên danh sách lựa chọn quy đổi sản phẩm.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">Lưu dữ liệu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}