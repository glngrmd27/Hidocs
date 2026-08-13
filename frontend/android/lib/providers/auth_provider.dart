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
        _currentUser = UserModel.fromJson(
            jsonDecode(userJson) as Map<String, dynamic>);
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

  Future<void> register(String email, String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiClient.post('/auth/register', body: {
        'name': username.trim(),
        'email': email.trim(),
        'password': password,
      });

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

  Future<void> resendOtp() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiClient.post('/auth/resend-otp', body: {
        'email': _pendingEmail,
      });
      _error = 'Kode OTP baru telah dikirim ke email Anda.';
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateProfile({required String name, required String email}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiClient.put('/users/me', body: {
        'name': name.trim(),
      });

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