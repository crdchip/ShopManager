import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:shop_manager/core/router/app_router.dart';
import 'package:shop_manager/core/storage/share_per_api.dart';
import 'package:shop_manager/features/auth/bloc/auth_bloc.dart';
import 'package:shop_manager/features/settings/bloc/locale_bloc.dart';

class MyApp extends StatelessWidget {
  final AppRouter appRouter;
  final StorageService storageService;
  final AuthBloc authBloc;

  const MyApp({
    super.key,
    required this.storageService,
    required this.appRouter,
    required this.authBloc,
  });

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      // Dùng RepositoryProvider để cung cấp Service
      providers: [RepositoryProvider.value(value: storageService)],
      child: MultiBlocProvider(
        providers: [
          BlocProvider.value(value: authBloc),
          BlocProvider(create: (context) => LocaleBloc()),
        ],
        child: BlocBuilder<LocaleBloc, LocaleState>(
          builder: (context, state) {
            return MaterialApp.router(
              locale: state.locale,
              supportedLocales: const [Locale('vi', ''), Locale('en', '')],
              localizationsDelegates: const [
                GlobalMaterialLocalizations.delegate,
                GlobalWidgetsLocalizations.delegate,
                GlobalCupertinoLocalizations.delegate,
              ],
              routerConfig: appRouter.router,
              title: 'Quản lý bán hàng',
              theme: ThemeData(primarySwatch: Colors.blue),
            );
          },
        ),
      ),
    );
  }
}
