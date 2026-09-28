// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách các trang KHÔNG CẦN đăng nhập (Trang công khai)
const publicPaths = ["/login", "/register", "/public-page"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Lấy accessToken từ Cookie hệ thống
  const token = request.cookies.get("accessToken")?.value;

  // 2. Kiểm tra xem trang hiện tại có nằm trong danh sách public không
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path));

  // TÌNH HUỐNG 1: Chưa đăng nhập VÀ cố tình vào trang bảo mật (Dashboard, Categories...)
  if (!token && !isPublicPath) {
    // Ép nhảy về trang /login kèm tham số callbackUrl để sau khi login xong tự quay lại trang cũ
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // TÌNH HUỐNG 2: Đã đăng nhập rồi VÀ cố tình quay lại trang /login
  if (token && isPublicPath && pathname.startsWith("/login")) {
    // Đá ngược ông ấy vào trang quản trị chính (Ví dụ: /dashboard hoặc /)
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Cho phép tiếp tục hành trình nếu hợp lệ
  return NextResponse.next();
}

// 🌟 QUAN TRỌNG: Cấu hình chỉ chạy middleware trên các trang thực tế, bỏ qua file tĩnh
export const config = {
  matcher: [
    /*
     * Khớp tất cả các request ngoại trừ:
     * - api (các tuyến API nội bộ)
     * - _next/static (file tĩnh của Next.js)
     * - _next/image (tối ưu hình ảnh)
     * - favicon.ico, sitemap.xml, robots.txt (file hệ thống công khai)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};