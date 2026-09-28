"use client"; // Bắt buộc vì có sử dụng usePathname để check active link

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  Truck,
  Settings,
  Layers,
  ShieldCheck,
  LogOut
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Danh sách các menu điều hướng dựa trên cấu trúc bạn đã chụp
  const menuItems = [
    { name: "Tổng quan", href: "/dashboard", icon: LayoutDashboard },
    { name: "Người dùng", href: "/users", icon: Users },
    { name: "Nhà cung cấp", href: "/suppliers", icon: Truck },
    { name: "Sản phẩm", href: "/products", icon: Package },
    { name: "Danh mục sản phẩm", href: "/categories", icon: Layers },
    { name: "Danh mục Units", href: "/units", icon: Settings },
    { name: "Danh mục quyền", href: "/permissions", icon: ShieldCheck },
    { name: "Quản lý quyền", href: "/roles", icon: ShieldCheck },
  ];

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* 1. SIDEBAR CỐ ĐỊNH */}
      <aside className="w-64 bg-zinc-950 text-zinc-300 flex flex-col border-r border-zinc-800">
        <Link href="/" className="block p-6 hover:bg-zinc-900 transition-colors group">
          <h2 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
            Manager Shop
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase mt-1">Hệ thống quản trị v0.1</p>
        </Link>

        <nav className="flex-1 px-4 space-y-1">
          <div className="text-[10px] font-semibold text-zinc-500 uppercase px-2 mb-2 tracking-widest">
            Quản lý hệ thống
          </div>

          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${isActive
                    ? "bg-zinc-800 text-white shadow-sm"
                    : "hover:bg-zinc-900 hover:text-white"
                  }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-zinc-500"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Nút Đăng xuất ở dưới cùng Sidebar */}
        <div className="p-4 border-t border-zinc-900">
          <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-zinc-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* 2. NỘI DUNG CHÍNH (MAIN CONTENT) */}
      <div className="flex-1 flex flex-col">
        {/* Header trên cùng */}
        <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-8">
          <div className="text-sm font-medium text-zinc-500">
            {/* Hiển thị tên trang hiện tại một cách tự động */}
            Trang chủ / <span className="text-zinc-950 capitalize">{pathname.replace("/", "")}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-zinc-200 border border-zinc-300" />
            <span className="text-sm font-semibold">Admin Sơn</span>
          </div>
        </header>

        {/* KHU VỰC HIỂN THỊ TRANG CON (PAGE.TSX) */}
        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  );
}