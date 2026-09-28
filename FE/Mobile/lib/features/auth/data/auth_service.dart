import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shop_manager/core/constants/api_constants.dart';
import 'package:shop_manager/core/network/dio_client.dart';
import 'package:shop_manager/core/storage/share_per_api.dart';

class AuthService {
  final StorageService storageService;
  final _storage = const FlutterSecureStorage();

  AuthService(this.storageService);

  Future<bool> loginAllSystems(String user, String pass) async {
    // Chạy song song 3 API
    // final results = await Future.wait([
    //   _loginSystem(ApiType.hrm, user, pass),
    //   _loginSystem(ApiType.tms, user, pass),
    //   _loginSystem(ApiType.npt, user, pass),
    // ]);

    // // Kiểm tra xem có ít nhất 1 cái thành công không (true)
    // bool isAtLeastOneSuccess = results.contains(true);

    // if (isAtLeastOneSuccess) {
    //   // Bạn có thể lưu trạng thái "đã login" chung ở đây
    //   return true;
    // }
    return false;
  }

  Future<bool> _loginSystem(String user, String pass) async {
    try {
      final client = DioClient(storageService: storageService);
      final response = await client.post(
        ApiConstants.login,
        data: {"username": user, "password": pass},
      );

      // Xử lý khi thành công
      if (response.data['status_code'] == 200) {
        // ... lưu token ...
        return true;
      }
      return false;
    } on DioException catch (_) {
      // Không cần làm gì nhiều ở đây, vì Interceptor đã hiển thị Toast/Log rồi
      return false;
    } catch (e) {
      // Các lỗi logic code khác
      return false;
    }
  }

  static Future<void> logout() async {}

  static Future<bool> refreshToken() async {
    return false;
  }
}
