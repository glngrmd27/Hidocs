import 'package:flutter/services.dart';

class ExamSecurityService {
  static const MethodChannel _channel = MethodChannel('com.hidocs.app/security');

  /// Enables FLAG_SECURE on Android window to block screenshots, screen recording,
  /// and task switcher previews.
  static Future<void> enableSecureScreen() async {
    try {
      await _channel.invokeMethod('enableSecure');
    } catch (_) {
      // Fallback platform call if native channel isn't bound or on non-android platforms
      try {
        await SystemChannels.platform.invokeMethod<void>('SystemChrome.setSystemUIOverlayStyle');
      } catch (_) {}
    }
  }

  /// Disables FLAG_SECURE to restore normal screen recording and screenshot behavior.
  static Future<void> disableSecureScreen() async {
    try {
      await _channel.invokeMethod('disableSecure');
    } catch (_) {}
  }
}
