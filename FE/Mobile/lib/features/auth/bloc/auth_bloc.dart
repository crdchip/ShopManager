// features/auth/bloc/auth_bloc.dart
import 'package:flutter_bloc/flutter_bloc.dart';
import '../data/auth_service.dart';

part 'auth_event.dart';
part 'auth_state.dart';

class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthService authService;

  AuthBloc(this.authService) : super(AuthState.initial()) {
    
    // Xử lý sự kiện Đăng nhập
    on<LoginRequested>((event, emit) async {
      emit(AuthState(status: AuthStatus.loading));
      
      final success = await authService.loginAllSystems(event.username, event.password);
      
      if (success) {
        emit(AuthState(status: AuthStatus.authenticated));
      } else {
        emit(AuthState(status: AuthStatus.error, errorMessage: 'Sai tài khoản!'));
      }
    });

    // Xử lý Đăng xuất
    on<LogoutRequested>((event, emit) {
      // authService.logout();
      emit(AuthState(status: AuthStatus.unauthenticated));
    });
  }
}