import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Users, ShoppingCart, Truck } from "lucide-react"; // Cài lucide-react nếu chưa có

export default function AdminDashboard() {
  const stats = [
    { title: "Sản phẩm", value: "1,234", icon: Package, color: "text-blue-600" },
    { title: "Người dùng", value: "567", icon: Users, color: "text-green-600" },
    { title: "Đơn hàng", value: "+12", icon: ShoppingCart, color: "text-orange-600" },
    { title: "Nhà cung cấp", value: "45", icon: Truck, color: "text-purple-600" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Tổng quan quản trị</h1>
      
      {/* 1. Thẻ thống kê */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <item.icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
              <p className="text-xs text-muted-foreground">+5% so với tháng trước</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. Khu vực biểu đồ và danh sách */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Biểu đồ doanh thu</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t">
             <span className="text-muted-foreground">Chèn biểu đồ Recharts vào đây</span>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Sản phẩm vừa nhập</CardTitle>
          </CardHeader>
          <CardContent>
            {/* List sản phẩm mẫu */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-zinc-100" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sản phẩm mẫu #{i}</p>
                    <p className="text-xs text-muted-foreground">Số lượng: 100</p>
                  </div>
                  <div className="text-sm font-bold">500,000đ</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}