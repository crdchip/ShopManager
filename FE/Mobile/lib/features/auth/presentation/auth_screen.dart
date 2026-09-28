import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import '../bloc/auth_bloc.dart';
import '../../../core/router/route_constants.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  // Controller để lấy dữ liệu từ TextField
  final TextEditingController _userController = TextEditingController();
  final TextEditingController _passController = TextEditingController();

  @override
  void dispose() {
    _userController.dispose();
    _passController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // appBar: AppBar(title: const Text('TBS Logistics Login')),
      body: BlocConsumer<AuthBloc, AuthState>(
        // Listener dùng để xử lý các hành động "một lần" như chuyển trang, hiện thông báo
        listener: (context, state) {
          if (state.status == AuthStatus.authenticated) {
            // Đã login thành công -> Vào Home
            context.go(RouteConstants.home);
          } else if (state.status == AuthStatus.error) {
            // Hiển thị lỗi nếu login thất bại
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.errorMessage ?? 'Lỗi đăng nhập')),
            );
          }
        },
        // Builder dùng để vẽ lại giao diện dựa trên State (ví dụ: hiện Loading)
        builder: (context, state) {
          return Padding(
            padding: const EdgeInsets.all(20.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const FlutterLogo(size: 100),
                const SizedBox(height: 40),
                TextField(
                  controller: _userController,
                  decoration: const InputDecoration(
                    labelText: 'Tài khoản',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.person),
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  controller: _passController,
                  obscureText: true,
                  decoration: const InputDecoration(
                    labelText: 'Mật khẩu',
                    border: OutlineInputBorder(),
                    prefixIcon: Icon(Icons.lock),
                  ),
                ),
                const SizedBox(height: 30),
                SizedBox(
                  width: double.infinity,
                  height: 50,
                  child: ElevatedButton(
                    onPressed: state.status == AuthStatus.loading
                        ? null // Vô hiệu hóa nút khi đang load
                        : () {
                            // Gửi event login vào Bloc
                            context.read<AuthBloc>().add(
                                  LoginRequested(
                                    _userController.text,
                                    _passController.text,
                                  ),
                                );
                          },
                    child: state.status == AuthStatus.loading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('ĐĂNG NHẬP'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}