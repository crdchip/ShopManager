// features/auth/bloc/auth_event.dart
part of 'auth_bloc.dart';

abstract class AuthEvent {}

class LoginRequested extends AuthEvent {
  final String username;
  final String password;
  LoginRequested(this.username, this.password);
}

class LogoutRequested extends AuthEvent {}