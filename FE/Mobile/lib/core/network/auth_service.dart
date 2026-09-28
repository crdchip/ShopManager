import 'package:shop_manager/core/storage/share_per_api.dart';

class AuthService {
  final StorageService storageService;

  AuthService(this.storageService);

  static bool isRefreshing = false;

  static Future<bool> refreshToken() async {
    // if (isRefreshing) return false;
    // isRefreshing = true;

    try {
      // final token = await SharePerApi().getToken();

      // final dio = Dio();

      // final res = await dio.get(
      //   ApiConstants.urlRefreshTokenWms,
      //   options: Options(
      //     headers: {"Authorization": "Bearer $token"},
      //   ),
      //   queryParameters: {"token": token},
      // );

      // if (res.data is Map && res.data["rCode"] == 1) {
      //   final newToken = res.data["rData"];
      //   await SharePerApi().saveToken(newToken);
      //   return true;
      // }

      return false;
    } catch (_) {
      return false;
    } finally {
      isRefreshing = false;
    }
  }

  static void logout() async {
    // clear data + redirect login
    // final prefs = await SharedPreferences.getInstance();
    // await prefs.clear();

    // // Check if the box is already open
    // if (!Hive.isBoxOpen('teamBox')) {
    //   await Hive.openBox<HiveTeams>('teamBox');
    // }
    // // Clear the box
    // Hive.box<HiveTeams>('teamBox').clear();

    // Get.offAllNamed(Routes.LOGIN_PAGE);
  }
}
