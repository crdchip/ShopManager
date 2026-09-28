import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:shop_manager/core/router/route_constants.dart';
import 'package:shop_manager/features/auth/bloc/auth_bloc.dart';

class AppRouter {
  final AuthBloc authBloc;

  AppRouter(this.authBloc);

  late final GoRouter router = GoRouter(
    initialLocation: RouteConstants.login,
    refreshListenable: GoRouterRefreshStream(authBloc.stream),

    redirect: (context, state) {
      final bool loggedIn = authBloc.state.status == AuthStatus.authenticated;
      final bool loggingIn = state.matchedLocation == RouteConstants.login;

      // 1. Nếu chưa đăng nhập mà cố vào các trang khác -> Đá về Login
      if (!loggedIn && !loggingIn) return RouteConstants.login;

      // 2. Nếu đã đăng nhập mà vẫn ở trang Login -> Đẩy vào Home
      if (loggedIn && loggingIn) return RouteConstants.home;

      // Không có vấn đề gì thì cho đi tiếp
      return null;
    },

    routes: [
      GoRoute(
        path: RouteConstants.login,
        name: 'login',
        builder: (context, state) =>
            Scaffold(body: Center(child: Text("Login"))),
      ),
    ],
  );
}

class GoRouterRefreshStream extends ChangeNotifier {
  late final StreamSubscription<dynamic> _subscription;
  GoRouterRefreshStream(Stream<dynamic> stream) {
    notifyListeners();
    _subscription = stream.asBroadcastStream().listen((_) => notifyListeners());
  }
  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}
