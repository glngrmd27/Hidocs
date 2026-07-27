class UserModel {
  final String id;
  final String name;
  final String email;
  final String password;
  final UserRole role;
  final DateTime createdAt;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.password,
    required this.role,
    required this.createdAt,
  });

  bool get isAdmin => role == UserRole.admin;
  bool get isUser => role == UserRole.user;
}

enum UserRole { admin, user }