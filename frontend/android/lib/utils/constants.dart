import 'dart:math' as dartmath;

class AppConstants {
  static const String appName    = 'HiDocs!';
  static const String appVersion = '1.0.0';
  static const String appBaseUrl = 'http://localhost:8080/api/v1';
}

String generateRandomLink(int length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  final random = dartmath.Random();
  return List.generate(length, (_) => chars[random.nextInt(chars.length)])
      .join();
}
