'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // 📦 Đảm bảo đã cài js-cookie để xóa token sạch sẽ

// Định nghĩa danh sách các phân hệ con của Shop để dễ quản lý và render
const shopModules = [
  {
    title: 'Nhập Hàng (PO)',
    description: 'Quản lý phiếu nhập hàng, đối chiếu nhà cung cấp và cập nhật giá nhập mặc định.',
    link: '/purchase',
    icon: '📥',
    color: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
  },
  {
    title: 'Bán Hàng (POS)',
    description: 'Giao diện quét mã vạch bán hàng, in hóa đơn nhanh cho khách hàng lẻ.',
    link: '/sales',
    icon: '🛒',
    color: 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100',
  },
  {
    title: 'Báo Cáo Doanh Thu',
    description: 'Thống kê lợi nhuận, dòng tiền biến động và cảnh báo tồn kho sắp hết.',
    link: '/dashboard',
    icon: '📊',
    color: 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100',
  },
];

export default function ShopDashboardPage() {
  const router = useRouter();

  // Hàm xử lý đăng xuất tập trung
  const handleLogout = () => {
    // 1. Xóa toàn bộ Token lưu trữ trong Cookie hệ thống
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');

    // 2. Điều hướng người dùng về trang login
    router.push('/login');

    // 3. Ép Refresh để làm mới trạng thái và kích hoạt lại Middleware bảo mật
    router.refresh();
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      
      {/* ================= HEADER TỔNG CÓ THÊM NÚT ĐĂNG XUẤT ================= */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trung Tâm Quản Lý Cửa Hàng</h1>
          <p className="text-gray-500 text-sm">
            Hệ thống quản lý hệ sinh thái bán hàng, nhập kho và cấu hình sản phẩm đa đơn vị.
          </p>
        </div>
        
        {/* Nút đăng xuất được đẩy sang góc phải của Header */}
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all active:scale-95 shadow-sm self-start sm:self-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-4 h-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
          </svg>
          Đăng xuất
        </button>
      </div>
      {/* ==================================================================== */}

      {/* Lưới các phân hệ con */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shopModules.map((mod, index) => (
          <Link
            key={index}
            href={mod.link}
            className="p-6 rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between group cursor-pointer"
          >
            <div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl mb-4 border ${mod.color.split(' ')[0]} ${mod.color.split(' ')[1]}`}>
                {mod.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors mb-2">
                {mod.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                {mod.description}
              </p>
            </div>

            <div className="flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
              Truy cập phân hệ <span className="ml-1">&rarr;</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Widget Tiện ích nhanh */}
      <div className="mt-12 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          ⚡ Thao tác nhanh
        </h2>
        <div className="flex flex-wrap gap-4">
          <Link href="/purchase" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
            + Lập phiếu nhập kho mới
          </Link>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-gray-300">
            Kiểm kê kho hàng nhanh
          </button>
        </div>
      </div>
    </div>
  );
}