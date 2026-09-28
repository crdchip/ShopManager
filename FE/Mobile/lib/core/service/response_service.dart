import 'package:dio/dio.dart';
import 'package:shop_manager/data/message/message.dart';

class ResponseService {
  Future<void> responseService(Response? response) async {
    if (response != null) {
      MessageApp.show("Mất kết lỗi");
    } else if (response?.statusCode == 400) {
      MessageApp.show("Mất kết lỗi");
    }
  }
}
