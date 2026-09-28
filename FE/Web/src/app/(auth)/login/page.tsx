"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Import authService vừa tạo
import { userService } from "@/services/user.service";

// 1. Chuyển đổi Schema validate từ email sang userName theo thiết kế DB
const loginSchema = z.object({
  userName: z.string().min(3, { message: "Tên đăng nhập phải chứa ít nhất 3 ký tự." }),
  password: z.string().min(6, { message: "Mật khẩu phải chứa ít nhất 6 ký tự." }),
});

export default function LoginPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // 2. Khởi tạo Form với react-hook-form
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      userName: "",
      password: "",
    },
  });

  // 3. Xử lý logic khi bấm Submit
  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setErrorMsg("");
    setLoading(true);
    
    try {
      const res = await userService.login(values);

      // Check cấu trúc rCode phản hồi từ FastAPI backend của bạn
      if (res.rCode === 1) {
        // Đăng nhập thành công, bóc tách chuỗi token và dữ liệu người dùng
        const { accessToken, user } = res.rData;

        // Lưu dữ liệu vào Cookie để Middleware bọc bảo vệ Route đọc được 
        document.cookie = `accessToken=${accessToken}; path=/; max-age=28800`; // Sống trong 8 tiếng ca trực
        document.cookie = `userData=${JSON.stringify(user)}; path=/; max-age=28800`;

        // Điều hướng cưỡng chế thẳng về trang chủ hệ thống
        router.push("/");
        router.refresh();
      } else {
        // Hiển thị thông báo lỗi từ tầng xử lý Service/Repo Backend (ví dụ: Sai mật khẩu)
        setErrorMsg(res.rMsg || "Đăng nhập thất bại, vui lòng kiểm tra lại tài khoản.");
      }
    } catch (error: any) {
      setErrorMsg("Không thể kết nối đến hệ thống máy chủ lúc này.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4 bg-zinc-50">
      <Card className="w-full max-w-sm shadow-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-zinc-900">
            HỆ THỐNG SHOP MANAGER
          </CardTitle>
          <CardDescription className="text-center">
            Đăng nhập tài khoản ca trực để truy cập POS hoặc Quản trị
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Khu vực thông báo lỗi hiển thị động */}
          {errorMsg && (
            <div className="mb-4 p-2 text-sm font-medium border border-red-200 bg-red-50 text-red-600 rounded-md text-center">
              {errorMsg}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Trường dữ liệu: Tên đăng nhập */}
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tài khoản nhân viên..." {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Trường dữ liệu: Mật khẩu */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mật khẩu</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••" {...field} disabled={loading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Button Submit tích hợp trạng thái loading */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 text-white hover:bg-blue-700 font-bold"
                disabled={loading}
              >
                {loading ? "Đang xác thực hệ thống..." : "ĐĂNG NHẬP"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}