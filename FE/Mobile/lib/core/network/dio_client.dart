import 'package:dio/dio.dart';
import 'package:shop_manager/core/network/auth_interceptor.dart';
import 'package:shop_manager/core/network/network_interceptor.dart';
import 'package:shop_manager/core/storage/share_per_api.dart';
import 'package:shop_manager/core/utils/logs/logger.dart';

class DioClient {
  late final Dio dio;
  final StorageService storageService;

  DioClient({
    required this.storageService,
    Duration connectTimeout = const Duration(seconds: 30),
    Duration receiveTimeout = const Duration(seconds: 30),
    LogSource logSource = LogSource.other,
    String processing = "",
  }) {
    dio = Dio(
      BaseOptions(
        connectTimeout: connectTimeout,
        receiveTimeout: receiveTimeout,
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
      ),
    );

    dio.interceptors.addAll([
      AuthInterceptor(dio, storageService),
      NetworkInterceptor(logSource: logSource, processing: processing),
    ]);
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) => dio.get<T>(path, queryParameters: queryParameters, options: options);

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    ProgressCallback? onSendProgress,
  }) => dio.post<T>(
    path,
    data: data,
    options: options,
    queryParameters: queryParameters,
    onSendProgress: onSendProgress,
  );

  Future<Response<T>> put<T>(String path, {dynamic data, Options? options}) =>
      dio.put<T>(path, data: data, options: options);

  Future<Response<T>> delete<T>(String path, {Options? options}) =>
      dio.delete<T>(path, options: options);
}
