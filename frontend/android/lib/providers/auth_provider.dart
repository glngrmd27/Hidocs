import 'package:flutter/material.dart';
import '../models/user_model.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _currentUser;
  bool _isLoading = false;
  String? _error;

  final List<UserModel> _users = [
    UserModel(
      id: 'admin001',
      name: 'Admin',
      email: 'admin@hidocs.app',
      password: 'admin123',
      role: UserRole.admin,
      createdAt: DateTime(2024, 1, 15),
    ),
    UserModel(
      id: 'user001',
      name: 'Budi',
      email: 'budi@email.com',
      password: 'user123',
      role: UserRole.user,
      createdAt: DateTime(2024, 3, 20),
    ),
  ];

  UserModel? get currentUser => _currentUser;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _currentUser != null;
  bool get isAdmin => _currentUser?.role == UserRole.admin;
  bool get isUser => _currentUser?.role == UserRole.user;

  Future<void> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 1200));

    try {
      final user = _users.firstWhere(
        (u) => (u.name.toLowerCase() == username.toLowerCase() || u.email.toLowerCase() == username.toLowerCase()) && u.password == password,
      );
      _currentUser = user;
    } catch (e) {
      _error = 'Username atau password salah';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> register(String email, String username, String password, UserRole role) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    await Future.delayed(const Duration(milliseconds: 1500));

    final existsEmail = _users.any((u) => u.email.toLowerCase() == email.toLowerCase());
    final existsName = _users.any((u) => u.name.toLowerCase() == username.toLowerCase());

    if (existsEmail) {
      _error = 'Email sudah terdaftar';
    } else if (existsName) {
      _error = 'Username sudah terdaftar';
    } else {
      final newUser = UserModel(
        id: 'user${DateTime.now().millisecondsSinceEpoch}',
        name: username,
        email: email,
        password: password,
        role: role,
        createdAt: DateTime.now(),
      );
      _users.add(newUser);
      _currentUser = newUser;
    }

    _isLoading = false;
    notifyListeners();
  }

  void logout() {
    _currentUser = null;
    _error = null;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  void updateProfile({
    required String name,
    required String email,
  }) {
    if (_currentUser == null) return;

    final updatedUser = UserModel(
      id: _currentUser!.id,
      name: name,
      email: email,
      password: _currentUser!.password,
      role: _currentUser!.role,
      createdAt: _currentUser!.createdAt,
    );

    final index = _users.indexWhere(
      (user) => user.id == _currentUser!.id,
    );

    if (index != -1) {
      _users[index] = updatedUser;
    }

    _currentUser = updatedUser;

    notifyListeners();
  }
}