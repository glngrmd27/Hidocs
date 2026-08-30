import 'dart:math' as dartmath;

import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static const String appName    = 'HiDocs!';
  static const String appVersion = '1.0.0';

  /// Base URL diambil dari .env (API_BASE_URL).
  /// Fallback ke ngrok default jika .env belum di-load (mis. unit test).
  /// Untuk local emulator gunakan http://10.0.2.2:8080/api/v1
  static String get appBaseUrl {
    final envUrl = dotenv.env['API_BASE_URL']?.trim();
    if (envUrl != null && envUrl.isNotEmpty) {
      // Hapus trailing slash biar konsisten dengan ApiClient path '/auth/login'
      return envUrl.endsWith('/') ? envUrl.substring(0, envUrl.length - 1) : envUrl;
    }
    return 'https://abortively-proexecutive-graham.ngrok-free.dev/api/v1';
  }
}

String generateRandomLink(int length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  final random = dartmath.Random();
  return List.generate(length, (_) => chars[random.nextInt(chars.length)])
      .join();
}
