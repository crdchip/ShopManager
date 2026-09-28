import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

part 'locale_event.dart';
part 'locale_state.dart';

class LocaleBloc extends Bloc<LocaleEvent, LocaleState> {
  LocaleBloc() : super(const LocaleState(Locale('vi'))) {
    
    // Xử lý sự kiện thay đổi ngôn ngữ
    on<ChangeLocale>((event, emit) {
      emit(LocaleState(event.locale));
    });

    // Xử lý logic tải ngôn ngữ đã lưu (nếu có)
    on<LoadStoredLocale>((event, emit) async {
      // Logic lấy từ SharedPreferences sẽ viết ở đây
      // emit(LocaleState(savedLocale));
    });
  }
}