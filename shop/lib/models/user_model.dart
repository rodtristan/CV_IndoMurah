class UserModel {
  final String id;
  final String fullName;
  final String email;
  final String? phoneNumber;

  UserModel({required this.id, required this.fullName, required this.email, this.phoneNumber});

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'].toString(),
      fullName: json['full_name'] as String,
      email: json['email'] as String,
      phoneNumber: json['phone_number'] as String?,
    );
  }
}
