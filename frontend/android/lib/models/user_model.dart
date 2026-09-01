class UserModel {
  final String id;
  final String name;
  final String email;
  final String password;
  final String? phoneNumber;
  final UserRole role;
  final DateTime createdAt;
  final bool isActive;

  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.password,
    this.phoneNumber,
    required this.role,
    required this.createdAt,
    this.isActive = true,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    final roleValue = (json['role'] ?? '').toString().toLowerCase();
    final rawActive = json['is_active'] ?? json['isActive'] ?? json['active'];
    bool active = true;
    if (rawActive is bool) active = rawActive;
    else if (rawActive is num) active = rawActive != 0;
    else if (rawActive is String) active = rawActive.toLowerCase() != 'false' && rawActive != '0';

    return UserModel(
      id: (json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      email: (json['email'] ?? '').toString(),
      password: (json['password'] ?? '').toString(),
      phoneNumber:
          json['phone_number']?.toString() ?? json['phone']?.toString(),
      role: roleValue == 'admin'
          ? UserRole.admin
          : roleValue == 'superadmin'
              ? UserRole.superadmin
              : UserRole.user,
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ??
          DateTime.now(),
      isActive: active,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone_number': phoneNumber,
      'role': role == UserRole.admin
          ? 'admin'
          : role == UserRole.superadmin
              ? 'superadmin'
              : 'user',
      'is_active': isActive,
      'created_at': createdAt.toIso8601String(),
    };
  }

  bool get isAdmin => role == UserRole.admin;
  bool get isSuperAdmin => role == UserRole.superadmin;
  bool get isUser => role == UserRole.user;
}

enum UserRole { user, admin, superadmin }