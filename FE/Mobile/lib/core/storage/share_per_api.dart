import 'package:shared_preferences/shared_preferences.dart';
import 'package:shop_manager/core/constants/constants.dart';

class StorageService {
  final SharedPreferences _prefs;

  // Constructor nhận SharedPreferences đã khởi tạo từ main
  StorageService(this._prefs);

  // --- AUTH TOKENS ---
  String? getToken() => _prefs.getString(AppConstants.ACCESS_TOKEN);

}