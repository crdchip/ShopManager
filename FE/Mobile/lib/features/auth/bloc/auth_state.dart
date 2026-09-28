// features/auth/bloc/auth_state.dart
part of 'auth_bloc.dart';

enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final String? errorMessage;

  AuthState({required this.status, this.errorMessage});

  // Trạng thái ban đầu
  factory AuthState.initial() => AuthState(status: AuthStatus.initial);
}