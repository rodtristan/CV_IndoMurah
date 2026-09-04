import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Penyimpanan token JWT secara aman (Keychain di iOS, Keystore di Android).
class AuthStorageService {
  AuthStorageService._();
  static final AuthStorageService instance = AuthStorageService._();

  final _storage = const FlutterSecureStorage();
  static const _tokenKey = 'auth_token';

  Future<void> saveToken(String token) => _storage.write(key: _tokenKey, value: token);

  Future<String?> getToken() => _storage.read(key: _tokenKey);

  Future<bool> isLoggedIn() async => (await getToken()) != null;

  Future<void> clear() => _storage.delete(key: _tokenKey);
}
