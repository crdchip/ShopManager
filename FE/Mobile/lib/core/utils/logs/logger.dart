import 'package:flutter/foundation.dart';

enum LogSource {service, job, other}

class LogApp {
  static final LogApp _instance = LogApp._internal();
  LogApp._internal();
  factory LogApp() => _instance;

  static bool _isDebug = true; // Bật/tắt log

  static void debug(String message, {LogSource source = LogSource.other, required String processing}){
    if(_isDebug){
      _printLog("DEBUG", message, source, processing,  );
    }
  }

  static void info(String message, {LogSource source = LogSource.other, required String processing}){
    if(_isDebug){
      _printLog("ℹ️ INFO", message, source, processing,  );
    }
  }

  static void warning(String message, {LogSource source = LogSource.other, required String processing}){
    if(_isDebug){
      _printLog("⚠️ WARNING", message, source, processing,  );
    }
  }

  static void error(String message, {LogSource source = LogSource.other, required String processing}){
    if(_isDebug){
      _printLog("❌ ERROR", message, source, processing,  );
    }
  }


  static void _printLog(
    String level, 
    String message,
    LogSource source,
    String processing,
  
  ){
    final sourceTag = source.name.toLowerCase();
    final formattedMessage = "[$level] [$sourceTag] [$processing] $message";

    debugPrint(formattedMessage);
  }
  
}