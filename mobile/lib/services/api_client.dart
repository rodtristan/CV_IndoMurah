import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';

import '../core/constants/api_endpoints.dart';
import '../models/absensi_models.dart';

/// Server answered with an error (4xx/5xx). [message] is already Indonesian.
class ApiException implements Exception {
  final int statusCode;
  final String message;
  const ApiException(this.statusCode, this.message);

  @override
  String toString() => message;
}

/// Token expired / invalid. The app logs out when this is thrown.
class UnauthorizedException extends ApiException {
  const UnauthorizedException([String message = 'Sesi berakhir, silakan login ulang.'])
      : super(401, message);
}

/// No connection, DNS failure, timeout... => the app should work offline.
class NetworkException implements Exception {
  final String message;
  const NetworkException([this.message = 'Tidak ada koneksi internet.']);

  @override
  String toString() => message;
}

class LoginResult {
  final String token;
  final MeData me;
  const LoginResult(this.token, this.me);
}

/// Thin HTTP client for /attendance-mobile/*.
class ApiClient {
  ApiClient({required this.tokenProvider, this.onUnauthorized});

  final Future<String?> Function() tokenProvider;

  /// Called whenever any request returns 401.
  final void Function()? onUnauthorized;

  static const _timeout = Duration(seconds: 20);
  static const _uploadTimeout = Duration(seconds: 45);

  Future<Map<String, String>> _headers({bool json = false}) async {
    final token = await tokenProvider();
    return {
      'Accept': 'application/json',
      if (json) 'Content-Type': 'application/json',
      if (token != null && token.isNotEmpty) 'Authorization': 'Bearer $token',
    };
  }

  Future<LoginResult> login(String username, String password) async {
    final res = await _send(() async => http.post(
          Uri.parse(ApiEndpoints.login),
          headers: await _headers(json: true),
          body: jsonEncode({'username': username, 'password': password}),
        ), isLogin: true);
    final body = _decode(res);
    final token = (body['token'] ?? '').toString();
    if (token.isEmpty) {
      throw const ApiException(500, 'Respon login tidak valid dari server.');
    }
    return LoginResult(token, MeData.fromJson(body, fetchedAt: DateTime.now()));
  }

  Future<MeData> me() async {
    final res = await _send(() async =>
        http.get(Uri.parse(ApiEndpoints.me), headers: await _headers()));
    return MeData.fromJson(_decode(res), fetchedAt: DateTime.now());
  }

  /// [month] is `YYYY-MM`.
  Future<List<Attendance>> history(String month) async {
    final uri = Uri.parse(ApiEndpoints.history)
        .replace(queryParameters: {'month': month});
    final res =
        await _send(() async => http.get(uri, headers: await _headers()));
    final body = _decode(res);
    return ((body['items'] as List?) ?? const [])
        .whereType<Map>()
        .map((e) => Attendance.fromJson(e.cast<String, dynamic>()))
        .toList();
  }

  /// POST multipart clock-in / clock-out. Returns the updated attendance.
  Future<Attendance> clock({
    required ClockKind kind,
    required String photoPath,
    required double latitude,
    required double longitude,
    required double accuracy,
    required bool isMocked,
    required bool offline,
    required DateTime capturedAt,
  }) async {
    final url =
        kind == ClockKind.clockIn ? ApiEndpoints.clockIn : ApiEndpoints.clockOut;
    final res = await _send(() async {
      final req = http.MultipartRequest('POST', Uri.parse(url))
        ..headers.addAll(await _headers())
        ..fields['latitude'] = latitude.toString()
        ..fields['longitude'] = longitude.toString()
        ..fields['accuracy'] = accuracy.toStringAsFixed(1)
        ..fields['isMocked'] = isMocked ? 'true' : 'false'
        ..fields['offline'] = offline ? 'true' : 'false'
        ..fields['capturedAt'] = capturedAt.toUtc().toIso8601String()
        ..files.add(await http.MultipartFile.fromPath(
          'photo',
          photoPath,
          filename: 'selfie.jpg',
          // Server menolak foto tanpa content-type image/*.
          contentType: MediaType('image', 'jpeg'),
        ));
      final streamed = await req.send().timeout(_uploadTimeout);
      return http.Response.fromStream(streamed);
    }, timeout: _uploadTimeout);
    return Attendance.fromJson(_decode(res));
  }

  // ---------------------------------------------------------------------------

  Future<http.Response> _send(
    Future<http.Response> Function() call, {
    bool isLogin = false,
    Duration timeout = _timeout,
  }) async {
    http.Response res;
    try {
      res = await call().timeout(timeout);
    } on SocketException {
      throw const NetworkException();
    } on TimeoutException {
      throw const NetworkException('Koneksi ke server terlalu lama (timeout).');
    } on HandshakeException {
      throw const NetworkException('Gagal membuat koneksi aman ke server.');
    } on http.ClientException {
      throw const NetworkException();
    }

    if (res.statusCode >= 200 && res.statusCode < 300) return res;

    final msg = _errorMessage(res);
    if (res.statusCode == 401 && !isLogin) {
      onUnauthorized?.call();
      throw UnauthorizedException(msg);
    }
    throw ApiException(res.statusCode, msg);
  }

  Map<String, dynamic> _decode(http.Response res) {
    try {
      final v = jsonDecode(utf8.decode(res.bodyBytes));
      if (v is Map<String, dynamic>) return v;
    } catch (_) {}
    throw const ApiException(500, 'Respon server tidak dapat dibaca.');
  }

  String _errorMessage(http.Response res) {
    try {
      final v = jsonDecode(utf8.decode(res.bodyBytes));
      if (v is Map) {
        final m = v['message'];
        if (m is List && m.isNotEmpty) return m.join('\n');
        if (m is String && m.isNotEmpty) return m;
      }
    } catch (_) {}
    switch (res.statusCode) {
      case 401:
        return 'Username atau password salah.';
      case 429:
        return 'Terlalu banyak percobaan. Coba lagi dalam 1 menit.';
      default:
        return res.statusCode >= 500
            ? 'Server sedang bermasalah (${res.statusCode}). Coba lagi nanti.'
            : 'Permintaan gagal (${res.statusCode}).';
    }
  }
}
