import 'dart:math' as dartmath;

import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  static const String appName = 'HiDocs!';
  static const String appVersion = '1.0.0';

  /// Base URL untuk API backend.
  /// WAJIB diset di file .env dengan key API_BASE_URL
  /// Lihat .env.example untuk contoh konfigurasi
  static String get appBaseUrl {
    final envUrl = dotenv.env['API_BASE_URL']?.trim();
    
    if (envUrl == null || envUrl.isEmpty) {
      throw Exception(
        'API_BASE_URL tidak ditemukan'
      );
    }

    // Hapus trailing slash untuk konsistensi
    return envUrl.endsWith('/') 
        ? envUrl.substring(0, envUrl.length - 1) 
        : envUrl;
  }
}

String generateRandomLink(int length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  final random = dartmath.Random.secure();
  return List.generate(length, (_) => chars[random.nextInt(chars.length)])
      .join();
}
