/// Represents an authenticated employee/user.
class UserModel {
  final String id;
  final String name;
  final String email;
  final String? role;
  final String? photoUrl;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.role,
    this.photoUrl,
  });

  /// Field names match the NestJS API response (`full_name`, `photo_url`)
  /// — see `AuthService.login`/`getMe` in `api/src/modules/auth`.
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id']?.toString() ?? '',
      name: (json['full_name'] ?? json['name'])?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString(),
      photoUrl: (json['photo_url'] ?? json['photoUrl'])?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'full_name': name,
      'email': email,
      if (role != null) 'role': role,
      if (photoUrl != null) 'photo_url': photoUrl,
    };
  }
}
