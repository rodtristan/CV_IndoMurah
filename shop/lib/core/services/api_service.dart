import 'dart:convert';
import 'package:http/http.dart' as http;
import 'auth_storage_service.dart';

/// Exception dilempar saat response API bukan 2xx.
class ApiException implements Exception {
  final int statusCode;
  final String message;
  ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// Wrapper tipis di atas package `http` untuk memanggil backend NestJS
/// (folder `api/`). Otomatis menyisipkan header Authorization Bearer
/// jika user sudah login.
class ApiService {
  ApiService._();
  static final ApiService instance = ApiService._();

  Future<Map<String, String>> _headers({bool withAuth = true}) async {
    final headers = {'Content-Type': 'application/json'};
    if (withAuth) {
      final token = await AuthStorageService.instance.getToken();
      if (token != null) headers['Authorization'] = 'Bearer $token';
    }
    return headers;
  }

  dynamic _handle(http.Response res) {
    final body = res.body.isNotEmpty ? jsonDecode(res.body) : null;
    if (res.statusCode >= 200 && res.statusCode < 300) {
      return body;
    }
    final message = (body is Map && body['message'] != null)
        ? body['message'].toString()
        : 'Terjadi kesalahan (${res.statusCode})';
    throw ApiException(res.statusCode, message);
  }

  Future<dynamic> get(String url, {bool withAuth = true}) async {
    final res = await http.get(Uri.parse(url), headers: await _headers(withAuth: withAuth));
    return _handle(res);
  }

  Future<dynamic> post(String url, Map<String, dynamic> data, {bool withAuth = true}) async {
    final res = await http.post(
      Uri.parse(url),
      headers: await _headers(withAuth: withAuth),
      body: jsonEncode(data),
    );
    return _handle(res);
  }

  Future<dynamic> patch(String url, Map<String, dynamic> data, {bool withAuth = true}) async {
    final res = await http.patch(
      Uri.parse(url),
      headers: await _headers(withAuth: withAuth),
      body: jsonEncode(data),
    );
    return _handle(res);
  }

  Future<dynamic> delete(String url, {bool withAuth = true}) async {
    final res = await http.delete(Uri.parse(url), headers: await _headers(withAuth: withAuth));
    return _handle(res);
  }
}
