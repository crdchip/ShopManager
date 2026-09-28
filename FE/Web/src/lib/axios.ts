import axios from "axios";
import Cookies from "js-cookie"; 

// Nếu bạn dùng cơ chế Proxy (Rewrites trong next.config.js), hãy để baseURL là "/api"
// Nếu gọi trực tiếp, dùng process.env.NEXT_PUBLIC_API_URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// 1. REQUEST INTERCEPTOR: Đính kèm Token trước khi gửi đi
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy accessToken từ Cookie an toàn
    const token = Cookies.get("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. RESPONSE INTERCEPTOR: Xử lý kết quả trả về & Đánh chặn lỗi 401 (Hết hạn token)
axiosClient.interceptors.response.use(
  (response) => response, // Nếu API trả về 2xx -> Cho qua bình thường
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Unauthorized) và request này chưa từng thực hiện cơ chế thử lại (_retry)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu tránh vòng lặp vô hạn

      try {
        const refreshToken = Cookies.get("refreshToken");
        
        if (!refreshToken) {
          // Không có refreshToken thì cưỡng chế logout luôn, đỡ mất công gọi API
          throw new Error("No refresh token available");
        }

        // Sử dụng một instance axios mới hoàn toàn (axios không có interceptor) 
        // để gọi API refresh, tránh việc bị lặp interceptor vô hạn
        const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken }, {
          headers: { "Content-Type": "application/json" }
        });

        if (res.status === 200 || res.status === 201) {
          const newAccessToken = res.data.accessToken;
          const newRefreshToken = res.data.refreshToken; // Nếu backend trả cả cặp mới

          // Cập nhật lại vào Cookie (Lưu ý cấu hình secure: true nếu chạy HTTPS thực tế)
          Cookies.set("accessToken", newAccessToken, { expires: 1, path: '/' });
          if (newRefreshToken) {
            Cookies.set("refreshToken", newRefreshToken, { expires: 7, path: '/' });
          }

          // Gán lại token mới vào header của request bị lỗi ban nãy
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          
          // Thực thi lại request ban đầu bằng instance axios sạch để an toàn
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // Khi Refresh Token tạch (hết hạn, bị xóa, backend không chấp nhận...)
        // Tiến hành dọn sạch Cookie và đá người dùng về trang đăng nhập
        Cookies.remove("accessToken", { path: '/' });
        Cookies.remove("refreshToken", { path: '/' });
        
        if (typeof window !== "undefined") {
          // Lưu lại URL hiện tại để sau khi login xong có thể redirect quay lại (Tùy chọn)
          const currentPath = window.location.pathname;
          if (currentPath !== "/login") {
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          } else {
            window.location.href = "/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    // Trả về các lỗi khác (400, 403, 500...) cho tầng service xử lý tiếp
    return Promise.reject(error);
  }
);

export default axiosClient;