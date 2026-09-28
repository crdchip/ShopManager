import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';

class MessageApp {
  // Định nghĩa các loại icon cho nghiệp vụ kho
  static const String _errorIcon = "❌ ";
  static const String _successIcon = "✅ ";
  static const String _warningIcon = "⚠️ ";

  static void show(String message, {ToastType type = ToastType.error}) {
    Fluttertoast.cancel(); // Hủy thông báo cũ để tránh chồng chéo

    String prefix = "";
    Color bgColor = Colors.grey;
    Color labelColor = Colors.grey;

    switch (type) {
      case ToastType.error:
        prefix = _errorIcon;
        bgColor = Colors.white;
        labelColor = Colors.red;
        break;
      case ToastType.success:
        prefix = _successIcon;
        bgColor = Colors.white;
        labelColor = Colors.green;
        break;
      case ToastType.warning:
        prefix = _warningIcon;
        bgColor = Colors.white;
        labelColor = Colors.orange;
        break;
    }

    Fluttertoast.showToast(
      msg: "$prefix $message",
      toastLength: Toast.LENGTH_LONG,
      gravity: ToastGravity.BOTTOM,
      timeInSecForIosWeb: 3,
      backgroundColor: bgColor,
      textColor: labelColor,
      fontSize: 16.0,
    );
  }
}

enum ToastType { error, success, warning }
