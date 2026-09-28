import 'package:dio/dio.dart';
import 'package:shop_manager/core/network/auth_service.dart';
import 'package:shop_manager/core/storage/share_per_api.dart';
import 'package:shop_manager/core/utils/logs/logger.dart';

class AuthInterceptor extends Interceptor {
  final Dio dio;
  final StorageService storageService;

  AuthInterceptor(this.dio, this.storageService);

  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    // Tự động lấy token dựa trên apiType
    final String? token = storageService.getToken();
    if (token != null && token.isNotEmpty) {
      options.headers["Authorization"] = "Bearer $token";
    }
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) async {
    final data = response.data;

    // Chỉ xử lý khi backend trả rCode = 401
    if (data is Map && data["rCode"] == 401) {
      final req = response.requestOptions;

      // Tránh retry vô hạn
      if (req.extra["retry"] == true) {
        return handler.next(response);
      }

      final success = await AuthService.refreshToken();

      if (!success) {
        AuthService.logout();
        return handler.next(response);
      }

      final newToken = storageService.getToken();

      req.extra["retry"] = true;
      req.headers["Authorization"] = "Bearer $newToken";

      final retryResponse = await dio.fetch(req);

      return handler.resolve(retryResponse);
    }

    handler.next(response);
  }

  @override
  void onError(DioException e, ErrorInterceptorHandler handler) {
    final logKey = e.requestOptions.extra['logKey'];
    String errorMessage = "";

    // Phân loại lỗi
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
        errorMessage = "Kết nối quá hạn, vui lòng kiểm tra lại mạng.";
        break;
      case DioExceptionType.badResponse:
        // Xử lý các mã lỗi HTTP (400, 403, 404, 500...)
        errorMessage = _handleHttpResponse(
          e.response?.statusCode,
          e.response?.data,
        );
        break;
      case DioExceptionType.connectionError:
        errorMessage =
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra internet.";
        break;
      case DioExceptionType.cancel:
        errorMessage = "Yêu cầu đã bị hủy.";
        break;
      default:
        errorMessage = "Đã xảy ra lỗi không xác định.";
        break;
    }

    // Log lỗi chi tiết (giữ nguyên logic cũ của bạn)
    LogApp.error("[$logKey] ERROR: $errorMessage \nDetails: ${e.message}", processing: '');

    // Bạn có thể hiển thị Toast ở đây nếu muốn:
    // Toast.show(errorMessage);

    // Quan trọng: Phải gọi handler.next(e) để lỗi vẫn truyền về try-catch ở UI
    return handler.next(e);
  }

  // Hàm bổ trợ phân loại mã HTTP
  String _handleHttpResponse(int? statusCode, dynamic data) {
    switch (statusCode) {
      case 400:
        return "Yêu cầu không hợp lệ (400).";
      case 401:
        return "Phiên làm việc hết hạn (401).";
      case 403:
        return "Bạn không có quyền truy cập (403).";
      case 404:
        return "Không tìm thấy tài nguyên (404).";
      case 500:
        return "Máy chủ đang gặp sự cố (500).";
      case 502:
        return "Cổng kết nối bị lỗi (502).";
      default:
        return "Lỗi máy chủ ($statusCode).";
    }
  }
}
