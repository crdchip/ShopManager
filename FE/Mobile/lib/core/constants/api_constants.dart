class ApiConstants {
  static String baseUrl = "";
  static String _path(String endpoint) => "$baseUrl/$endpoint";

  static String get login => _path("login");
}