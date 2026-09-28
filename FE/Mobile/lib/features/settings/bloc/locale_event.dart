part of 'locale_bloc.dart';

abstract class LocaleEvent {
  const LocaleEvent();
}

/// Sự kiện thay đổi ngôn ngữ thủ công
class ChangeLocale extends LocaleEvent {
  final Locale locale;

  const ChangeLocale(this.locale);
}

/// (Mở rộng) Sự kiện tự động phát hiện ngôn ngữ hệ thống khi mở app
class LoadStoredLocale extends LocaleEvent {}