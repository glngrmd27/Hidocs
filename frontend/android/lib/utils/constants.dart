import 'dart:math' as dartmath;

class AppConstants {
  static const String appName    = 'HiDocs!';
  static const String appVersion = '1.0.0';
  static const String appBaseUrl = 'hidocs.app';

  static const String demoAdminUsername = 'Admin HiDocs';
  static const String demoAdminPassword = 'admin123';
  static const String demoUserUsername  = 'Budi Santoso';
  static const String demoUserPassword  = 'user123';
}

String generateRandomLink(int length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  final random = dartmath.Random();
  return List.generate(length, (_) => chars[random.nextInt(chars.length)])
      .join();
}
