import 'dart:convert';

import 'package:http/http.dart' as http;

import 'auth_storage_service.dart';

/// Simple exception type for non-2xx API responses.
class ApiException implements Exception {
  final int statusCode;
  final String message;

  ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException($statusCode): $message';
}

/// Thin wrapper around the `http` package that centralizes:
///  - base headers (Content-Type, Accept)
///  - Bearer token injection from [AuthStorageService]
///  - basic JSON decoding / error handling
///
/// This is a scaffold: swap the `http` client for `dio` here later if
/// interceptors / retry / multipart uploads become necessary, without
/// touching call sites elsewhere in the app.
class ApiService {
  ApiService._internal();

  static final ApiService instance = ApiService._internal();

  final http.Client _client = http.Client();

  Future<Map<String, String>> _buildHeaders({bool withAuth = true}) async {
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (withAuth) {
      final token = await AuthStorageService.instance.getToken();
      if (token != null && token.isNotEmpty) {
        headers['Authorization'] = 'Bearer $token';
      }
    }

    return headers;
  }

  dynamic _handleResponse(http.Response response) {
    final statusCode = response.statusCode;
    final body = response.body.isNotEmpty ? jsonDecode(response.body) : null;

    if (statusCode >= 200 && statusCode < 300) {
      return body;
    }

    final message = (body is Map && body['message'] != null)
        ? body['message'].toString()
        : 'Terjadi kesalahan (status $statusCode).';
    throw ApiException(statusCode, message);
  }

  Future<dynamic> get(String url, {bool withAuth = true}) async {
    final headers = await _buildHeaders(withAuth: withAuth);
    final response = await _client.get(Uri.parse(url), headers: headers);
    return _handleResponse(response);
  }

  Future<dynamic> post(
    String url, {
    Map<String, dynamic>? body,
    bool withAuth = true,
  }) async {
    final headers = await _buildHeaders(withAuth: withAuth);
    final response = await _client.post(
      Uri.parse(url),
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  Future<dynamic> put(
    String url, {
    Map<String, dynamic>? body,
    bool withAuth = true,
  }) async {
    final headers = await _buildHeaders(withAuth: withAuth);
    final response = await _client.put(
      Uri.parse(url),
      headers: headers,
      body: body != null ? jsonEncode(body) : null,
    );
    return _handleResponse(response);
  }

  Future<dynamic> delete(String url, {bool withAuth = true}) async {
    final headers = await _buildHeaders(withAuth: withAuth);
    final response = await _client.delete(Uri.parse(url), headers: headers);
    return _handleResponse(response);
  }
}
