import 'package:dio/dio.dart';

Future<Response?> retryApi(
  Future<Response> Function() requestFunction, {
  int maxRetries = 3,
  Duration delay = const Duration(seconds: 1),
  void Function(int retryCount)? onRetry,
  // Thêm callback mới để xử lý việc tăng timeout bên ngoài nếu cần
  void Function(Duration newTimeout)? onTimeoutIncrease, 
}) async {
  int retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      return await requestFunction();
    } on DioException catch (e) {
      final isTimeout = e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.sendTimeout ||
          e.type == DioExceptionType.receiveTimeout;

      final shouldRetry = isTimeout ||
          e.type == DioExceptionType.connectionError ||
          (e.response == null && e.type != DioExceptionType.unknown);

      if (shouldRetry) {
        retryCount++;
        
        // Nếu là lỗi timeout, ta gọi callback để bên ngoài biết mà tăng thời gian
        if (isTimeout && onTimeoutIncrease != null) {
          // Giả sử mỗi lần tăng 5s
          onTimeoutIncrease(Duration(seconds: 5 * retryCount));
        }

        onRetry?.call(retryCount);
        await Future.delayed(delay);
      } else {
        rethrow;
      }
    }
  }
  return null;
}
