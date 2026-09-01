import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/user_model.dart';
import '../services/api_client.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _error;
  String _pendingEmail = '';
  bool _otpSent = false;

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _currentUser != null;
  bool get isAdmin => _currentUser?.role == UserRole.admin;
  bool get isSuperAdmin => _currentUser?.role == UserRole.superadmin;
  bool get isUser => _currentUser?.role == UserRole.user;
  String get roleLabel => _currentUser?.role == UserRole.superadmin
      ? 'superadmin'
      : _currentUser?.role == UserRole.admin
          ? 'admin'
          : 'user';
  bool get otpSent => _otpSent;
  String get pendingEmail => _pendingEmail;

  AuthProvider() {
    _restoreSession();
  }

  Future<void> _restoreSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final token = prefs.getString('auth_token');
      final userJson = prefs.getString('auth_user');

      if (token != null && token.isNotEmpty && userJson != null) {
        ApiClient.token = token;
        _currentUser =
            UserModel.fromJson(jsonDecode(userJson) as Map<String, dynamic>);
        notifyListeners();
      }
    } catch (_) {}
  }

  Future<void> _persistSession(Map<String, dynamic> data) async {
    final token = (data['token'] ?? '').toString();
    final userJson = data['user'] ?? {};

    ApiClient.token = token;
    _currentUser = UserModel.fromJson(
        userJson is Map ? Map<String, dynamic>.from(userJson) : {});

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('auth_user', jsonEncode(userJson));
  }

  Future<void> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiClient.post('/auth/login', body: {
        'email': username.trim(),
        'password': password,
      });

      if (data is Map) {
        await _persistSession(Map<String, dynamic>.from(data));
      }
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> register(
    String email,
    String username,
    String password, {
    String? phoneNumber,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final body = <String, dynamic>{
        'name': username.trim(),
        'email': email.trim(),
        'password': password,
      };

      if (phoneNumber != null && phoneNumber.trim().isNotEmpty) {
        body['phone_number'] = phoneNumber.trim();
      }

      await ApiClient.post('/auth/register', body: body);

      _pendingEmail = email.trim();
      _otpSent = true;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<bool> verifyOtp(String otpCode) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiClient.post('/auth/verify-otp', body: {
        'email': _pendingEmail,
        'otp_code': otpCode.trim(),
      });

      if (data is Map) {
        await _persistSession(Map<String, dynamic>.from(data));
      }

      _otpSent = false;
      _pendingEmail = '';
      _isLoading = false;
      notifyListeners();

      return true;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }

    _isLoading = false;
    notifyListeners();

    return false;
  }

  Future<bool> resendOtp() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiClient.post('/auth/resend-otp', body: {
        'email': _pendingEmail,
      });
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> updateProfile({
    required String name,
    required String email,
    String? phoneNumber,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final body = <String, dynamic>{
        'name': name.trim(),
      };

      if (phoneNumber != null) {
        body['phone_number'] = phoneNumber.trim();
      }

      final data = await ApiClient.put('/users/me', body: body);

      if (data is Map) {
        _currentUser = UserModel.fromJson(Map<String, dynamic>.from(data));

        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_user', jsonEncode(data));
      }
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }

    _isLoading = false;
    notifyListeners();
  }

  String? _lastResetToken;
  String? get lastResetToken => _lastResetToken;

  Future<bool> changePassword({required String oldPassword, required String newPassword}) async {
    final email = _currentUser?.email ?? '';
    if (email.isEmpty) {
      _error = 'Email tidak ditemukan. Silakan login ulang.';
      notifyListeners();
      return false;
    }
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      // 1. Verifikasi password lama via login
      final loginData = await ApiClient.post('/auth/login', body: {'email': email.trim(), 'password': oldPassword});
      // jika login gagal, exception akan throw
      if (loginData == null) throw ApiException('Password lama salah');
      // 2. Minta token reset (backend return token di JSON, tidak perlu email)
      final tokenData = await ApiClient.post('/auth/forgot-password', body: {'email': email.trim()});
      String? token;
      if (tokenData is Map && tokenData['reset_token'] != null) token = tokenData['reset_token'].toString();
      else if (tokenData is Map && tokenData['token'] != null) token = tokenData['token'].toString();
      if (token == null || token.isEmpty) {
        // fallback dari provider cache
        token = _lastResetToken;
      }
      if (token == null || token.isEmpty) {
        // coba ambil via forgotPassword yang sudah handle
        token = await forgotPassword(email);
        if (token == null || token.isEmpty) throw ApiException('Gagal mendapatkan token reset');
      }
      // 3. Reset dengan token
      await ApiClient.post('/auth/reset-password', body: {'token': token.trim(), 'new_password': newPassword});
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      // pesan khusus untuk password lama salah
      if (e.message.toLowerCase().contains('invalid') || e.statusCode == 401) {
        _error = 'Password lama salah';
      } else {
        _error = e.message;
      }
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<String?> forgotPassword(String email) async {
    _isLoading = true;
    _error = null;
    _lastResetToken = null;
    notifyListeners();
    try {
      final data = await ApiClient.post('/auth/forgot-password', body: {'email': email.trim()});
      // Backend returns {reset_token: token} inside data - email tidak terkirim karena SMTP belum konfigurasi
      if (data is Map && data['reset_token'] != null) {
        _lastResetToken = data['reset_token'].toString();
      } else if (data is Map && data['token'] != null) {
        _lastResetToken = data['token'].toString();
      } else {
        // success tapi tanpa token (jika email terkirim) -> anggap sukses tanpa token
        _lastResetToken = '';
      }
      _isLoading = false;
      notifyListeners();
      return _lastResetToken;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }
    _isLoading = false;
    notifyListeners();
    return null;
  }

  Future<bool> resetPassword(String token, String newPassword) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      await ApiClient.post('/auth/reset-password', body: {'token': token.trim(), 'new_password': newPassword});
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }
    _isLoading = false;
    notifyListeners();
    return false;
  }

  Future<void> logout() async {
    _currentUser = null;
    ApiClient.token = null;
    _otpSent = false;
    _pendingEmail = '';

    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('auth_token');
      await prefs.remove('auth_user');
    } catch (_) {}

    notifyListeners();
  }

  void clearError() {
    _error = null;
  }
}
