import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:shop_manager/app.dart';
import 'package:shop_manager/core/router/app_router.dart';
import 'package:shop_manager/core/storage/share_per_api.dart';
import 'package:shop_manager/features/auth/bloc/auth_bloc.dart';
import 'package:shop_manager/features/auth/data/auth_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Khởi tạo các dịch vụ khác (Firebase, Local DB, v.v.)
  final sharedPreferences = await SharedPreferences.getInstance();
  final storageService = StorageService(sharedPreferences);

  // 1. Khởi tạo Service xử lý API
  final authService = AuthService(storageService);

  // 2. Khởi tạo Bloc và truyền Service vào
  final authBloc = AuthBloc(authService);

  final appRouter = AppRouter(authBloc);

  runApp(
    MyApp(
      storageService: storageService,
      appRouter: appRouter,
      authBloc: authBloc,
    ),
  );
}
