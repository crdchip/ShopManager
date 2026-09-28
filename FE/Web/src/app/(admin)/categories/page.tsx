"use html";
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  FolderTree, 
  Plus, 
  Pencil, 
  Trash2, 
  ChevronDown, 
  ChevronRight, 
  RefreshCw, 
  Network
} from "lucide-react";
import { categoryService } from "@/services/category.service"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Category {
  idCategory: string;
  nameCategory: string;
  description: string;
  idParent: string | null;
  isActive: boolean;
}

interface TreeCategory extends Category {
  children?: TreeCategory[];
}

export default function CategoryTreePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    nameCategory: "",
    description: "",
    idParent: "root",
  });

  const buildTree = (data: Category[], parentId: string | null = null): TreeCategory[] => {
    return data
      .filter((item) => item.idParent === parentId)
      .map((item) => ({
        ...item,
        children: buildTree(data, item.idCategory),
      }));
  };

  const categoryTree = useMemo(() => buildTree(categories), [categories]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await categoryService.getAll();
      setCategories(res.data.rData || []);
    } catch (error) {
      console.error("Lỗi fetch:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- SỬA LOGIC: Tiếp nhận thêm tham số truyền nhanh idParent ---
  const handleOpenModal = (cat?: Category, fastParentId?: string) => {
    if (cat) {
      // Trường hợp: Nhấn SỬA danh mục
      setEditingCategory(cat);
      setFormData({
        nameCategory: cat.nameCategory,
        description: cat.description || "",
        idParent: cat.idParent || "root",
      });
    } else if (fastParentId) {
      // Trường hợp: Nhấn TẠO NHANH danh mục con cho một danh mục cha
      setEditingCategory(null);
      setFormData({
        nameCategory: "",
        description: "",
        idParent: fastParentId, // Tự động gán luôn ID của thằng vừa được chọn làm cha
      });
    } else {
      // Trường hợp: Nhấn THÊM MỚI danh mục gốc từ nút header chung
      setEditingCategory(null);
      setFormData({ nameCategory: "", description: "", idParent: "root" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        idParent: formData.idParent === "root" ? null : formData.idParent,
        createdBy: "admin-id" 
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.idCategory, payload);
      } else {
        await categoryService.create(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.detail || "Lỗi xử lý");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Xác nhận vô hiệu hóa danh mục này?")) {
      try {
        await categoryService.delete(id);
        loadData();
      } catch (e: any) {
        alert(e.response?.data?.detail || "Không thể xóa");
      }
    }
  };

  const CategoryNode = ({ node }: { node: TreeCategory }) => {
    const [isOpen, setIsOpen] = useState(true); // Mặc định thu gọn danh sách
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div className="ml-4 border-l border-zinc-200 pl-3 my-0.5">
        <div className="flex items-center gap-1.5 py-0.5 px-2 hover:bg-zinc-50 rounded group transition-all h-7">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`w-4 h-4 flex items-center justify-center rounded hover:bg-zinc-200 ${!hasChildren && "opacity-0"}`}
          >
            {isOpen ? <ChevronDown size={12} className="text-zinc-500" /> : <ChevronRight size={12} className="text-zinc-500" />}
          </button>

          <FolderTree className={`w-3.5 h-3.5 ${node.isActive ? "text-blue-500" : "text-zinc-400"}`} />
          
          <div className="flex-1 flex items-center gap-1.5">
            <span className={`text-xs font-medium text-zinc-700 ${!node.isActive && "text-zinc-400 line-through"}`}>
              {node.nameCategory}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono hidden md:inline opacity-0 group-hover:opacity-100 transition-opacity">
              ({node.idCategory.slice(0, 6)})
            </span>
          </div>

          {/* VÙNG ACTION CỦA MỖI NODE: ĐÃ THÊM NÚT TẠO CON NHANH */}
          <div className="opacity-0 group-hover:opacity-100 flex gap-0.5">
            {/* Nút Tạo nhanh danh mục con (Icon Plus xanh dương) */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5 rounded text-blue-600 hover:text-blue-700 hover:bg-blue-50" 
              title="Thêm danh mục con nhanh"
              onClick={() => handleOpenModal(undefined, node.idCategory)}
            >
              <Plus className="w-2.5 h-2.5" />
            </Button>

            {/* Nút Sửa */}
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded" onClick={() => handleOpenModal(node)}>
              <Pencil className="w-2.5 h-2.5" />
            </Button>

            {/* Nút Vô hiệu hóa/Xóa */}
            <Button variant="ghost" size="icon" className="h-5 w-5 rounded text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(node.idCategory)}>
              <Trash2 className="w-2.5 h-2.5" />
            </Button>
          </div>
        </div>

        {hasChildren && isOpen && (
          <div className="mt-0.5">
            {node.children?.map((child) => (
              <CategoryNode key={child.idCategory} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 bg-zinc-50 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-2 border-b">
          <div>
            <h1 className="text-lg font-bold flex items-center gap-1.5 text-zinc-800">
              <Network size={18} className="text-blue-600" /> Cấu trúc danh mục
            </h1>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={loadData} className="h-8 text-xs px-2.5">
              <RefreshCw className={`w-3 h-3 mr-1 ${isLoading && "animate-spin"}`} /> Tải lại
            </Button>
            <Button size="sm" onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 h-8 text-xs px-2.5">
              <Plus className="w-3 h-3 mr-1" /> Thêm danh mục gốc
            </Button>
          </div>
        </div>

        {/* Tree View Card */}
        <Card className="shadow-none border-zinc-200 rounded-md">
          <CardContent className="p-3">
            {isLoading ? (
              <div className="py-6 text-center text-xs text-zinc-400 italic">Đang tải sơ đồ cây...</div>
            ) : categoryTree.length > 0 ? (
              <div className="bg-white rounded">
                {categoryTree.map((rootNode) => (
                  <CategoryNode key={rootNode.idCategory} node={rootNode} />
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed rounded-lg text-xs text-zinc-400">
                Chưa có danh mục nào trên hệ thống.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Add/Edit */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm p-4 gap-3">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold">
              {editingCategory ? "Cập nhật danh mục" : "Tạo danh mục mới"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-1">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Tên danh mục <span className="text-red-500">*</span></Label>
              <Input 
                value={formData.nameCategory} 
                onChange={(e) => setFormData({...formData, nameCategory: e.target.value})} 
                placeholder="VD: Điện thoại"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Danh mục cha</Label>
              <Select 
                value={formData.idParent} 
                onValueChange={(val) => setFormData({...formData, idParent: val})}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Chọn danh mục cha" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root" className="text-xs">-- Danh mục gốc (Mặc định) --</SelectItem>
                  {categories
                    .filter(c => c.idCategory !== editingCategory?.idCategory) 
                    .map(c => (
                      <SelectItem key={c.idCategory} value={c.idCategory} className="text-xs">
                        {c.nameCategory}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Mô tả chi tiết</Label>
              <Input 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
                placeholder="Mô tả tóm tắt..."
                className="h-8 text-xs"
              />
            </div>
          </div>

          <DialogFooter className="mt-2 flex gap-1.5 justify-end">
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="h-8 text-xs">Hủy</Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 h-8 text-xs">Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}