This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


my-shop/
├── public/              # Chứa file tĩnh: logo, banner, icons...
├── src/
│   ├── app/             # Nơi chứa các trang (Routes)
│   │   ├── (auth)/      # Route Group cho đăng nhập/đăng ký (không hiện trên URL)
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (shop)/      # Route Group cho giao diện bán hàng
│   │   │   ├── products/
│   │   │   │   └── [id]/# Trang chi tiết sản phẩm (Dynamic Route)
│   │   │   └── cart/
│   │   ├── admin/       # Trang quản trị dành cho chủ shop
│   │   ├── api/         # Nơi viết các API Route (Backend bên trong Next.js)
│   │   ├── layout.tsx   # Layout chung toàn app (Navbar, Footer)
│   │   └── page.tsx     # Trang chủ (Homepage)
│   ├── components/      # Các thành phần giao diện tái sử dụng
│   │   ├── ui/          # Button, Input, Modal (dùng shadcn/ui) Đây là nơi chứa code từ Shadcn. Bạn rất ít khi sửa ở đây.
│   │   ├── common/      # Header, Footer, Sidebar, Những thứ dùng ở nhiều nơi nhưng không
│   │   └── product/     # ProductCard, ProductList Những module lớn gắn liền với một tính năng.
│   ├── hooks/           # Các Custom Hooks (useCart, useAuth...)
│   ├── lib/             # Cấu hình các thư viện bên thứ 3 (Prisma, Axios, Supabase)
│   ├── services/        # Các hàm gọi API (fetching data)
│   ├── store/           # Quản lý trạng thái (Zustand hoặc Redux)
│   └── types/           # Định nghĩa các Interface/Type (TypeScript)
├── .env.local           # Biến môi trường (Key API, Database URL)
├── next.config.mjs      # Cấu hình Next.js
└── tailwind.config.ts   # Cấu hình Tailwind CSS
