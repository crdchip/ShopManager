import axios from "axios";

const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000", // URL từ Swagger của bạn
  headers: {
    "Content-Type": "application/json",
  },
});

// Bạn có thể thêm Interceptor ở đây để tự động đính kèm Token sau này
export default http;