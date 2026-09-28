import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:shop_manager/core/utils/logs/logger.dart';

class NetworkInterceptor extends Interceptor {
  final LogSource logSource;
  final String processing;

  NetworkInterceptor({this.logSource = LogSource.other, this.processing = ""});

  @override
  void onRequest(options, handler) {
    final logKey = DateTime.now().millisecondsSinceEpoch.toString();
    options.extra['logKey'] = logKey;
    options.extra['startTime'] = DateTime.now();

    final logData = options.extra['dataScan'] ?? options.data;

    if (!kIsWeb) {
      LogApp.info(
        "[$logKey] REQUEST [${options.method}] ${options.uri}\n"
        "Data: $logData",
        source: logSource,
        processing: processing,
      );
    }
    handler.next(options);
  }

  @override
  void onResponse(response, handler) {
    final start = response.requestOptions.extra["startTime"] as DateTime?;
    final logKey = response.requestOptions.extra["logKey"];
    final duration = start != null
        ? DateTime.now().difference(start).inMilliseconds
        : 0;
    // print(
    //     "[$logKey] RESPONSE [${response.statusCode}] ${response.requestOptions.uri} \nrCode: ${response.data["rCode"]} \nrData: ${response.data["rData"]} \nDuration: ${duration}ms");
    if (!kIsWeb) {
      LogApp.info(
        "[$logKey] RESPONSE [${response.statusCode}] ${response.requestOptions.uri}"
        "\nDuration: ${duration}ms"
        "\nrCode: ${response.data["rCode"]}"
        "\nrData: ${response.data["rData"]}"
        "\nrMsg: ${response.data["rMsg"]}",
        source: logSource,
        processing: processing,
      );
    }

    print(
      "[$logKey] RESPONSE [${response.statusCode}] ${response.requestOptions.uri}"
      "\nDuration: ${duration}ms"
      "\nrCode: ${response.data["rCode"]}"
      "\nrData: ${response.data["rData"]}"
      "\nrMsg: ${response.data["rMsg"]}",
    );

    handler.next(response);
  }

  @override
  void onError(DioException e, handler) {
    final logKey = e.requestOptions.extra["logKey"];
    final start = e.requestOptions.extra["startTime"] as DateTime?;
    final duration = start != null
        ? DateTime.now().difference(start).inMilliseconds
        : 0;
    // print(
    //     "[$logKey] ERROR [${e.response?.statusCode}] ${e.requestOptions.uri}");
    if (!kIsWeb) {
      LogApp.error(
        "[$logKey] ERROR [${e.response?.statusCode}] ${e.requestOptions.uri}"
        "\nDuration: ${duration}ms"
        "\nMessage: ${e.message}",
        source: logSource,
        processing: processing,
      );
    }

    print(
      "[$logKey] ERROR [${e.response?.statusCode}] ${e.requestOptions.uri}"
      "\nDuration: ${duration}ms"
      "\nMessage: ${e.message}",
    );

    handler.next(e);
  }
}
