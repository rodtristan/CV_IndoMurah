import 'dart:convert';
import 'dart:io';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:path_provider/path_provider.dart';

import '../models/absensi_models.dart';

/// Persistent local storage:
///  - auth token in secure storage (Keystore / Keychain)
///  - cached /me response, offline queue and failed list as JSON files in the
///    app documents directory
///  - offline selfie photos in `<documents>/offline_photos/`
class LocalStore {
  LocalStore._();
  static final LocalStore instance = LocalStore._();

  static const _tokenKey = 'absensi_token';
  final _secure = const FlutterSecureStorage();

  String? _tokenCache;
  Directory? _dir;

  Future<Directory> get docsDir async =>
      _dir ??= await getApplicationDocumentsDirectory();

  Future<Directory> photosDir() async {
    final d = Directory('${(await docsDir).path}${Platform.pathSeparator}offline_photos');
    if (!await d.exists()) await d.create(recursive: true);
    return d;
  }

  // ---- token ----------------------------------------------------------------

  Future<String?> readToken() async {
    if (_tokenCache != null) return _tokenCache;
    try {
      _tokenCache = await _secure.read(key: _tokenKey);
    } catch (_) {
      _tokenCache = null;
    }
    return _tokenCache;
  }

  Future<void> saveToken(String token) async {
    _tokenCache = token;
    await _secure.write(key: _tokenKey, value: token);
  }

  Future<void> clearToken() async {
    _tokenCache = null;
    try {
      await _secure.delete(key: _tokenKey);
    } catch (_) {}
  }

  // ---- json files -----------------------------------------------------------

  Future<File> _file(String name) async =>
      File('${(await docsDir).path}${Platform.pathSeparator}$name');

  Future<dynamic> _readJson(String name) async {
    try {
      final f = await _file(name);
      if (!await f.exists()) return null;
      return jsonDecode(await f.readAsString());
    } catch (_) {
      return null;
    }
  }

  Future<void> _writeJson(String name, Object? value) async {
    final f = await _file(name);
    final tmp = File('${f.path}.tmp');
    await tmp.writeAsString(jsonEncode(value), flush: true);
    await tmp.rename(f.path); // atomic replace
  }

  Future<void> _deleteFile(String name) async {
    try {
      final f = await _file(name);
      if (await f.exists()) await f.delete();
    } catch (_) {}
  }

  // ---- cached /me -----------------------------------------------------------

  Future<MeData?> readMe() async {
    final j = await _readJson('me_cache.json');
    if (j is! Map) return null;
    try {
      return MeData.fromJson(j.cast<String, dynamic>());
    } catch (_) {
      return null;
    }
  }

  Future<void> saveMe(MeData me) => _writeJson('me_cache.json', me.toJson());

  Future<void> clearMe() => _deleteFile('me_cache.json');

  // ---- offline queue --------------------------------------------------------

  Future<List<OfflineItem>> readQueue() async {
    final j = await _readJson('offline_queue.json');
    if (j is! List) return [];
    return j
        .whereType<Map>()
        .map((e) => OfflineItem.fromJson(e.cast<String, dynamic>()))
        .toList();
  }

  Future<void> saveQueue(List<OfflineItem> items) =>
      _writeJson('offline_queue.json', items.map((e) => e.toJson()).toList());

  Future<List<FailedItem>> readFailed() async {
    final j = await _readJson('offline_failed.json');
    if (j is! List) return [];
    return j
        .whereType<Map>()
        .map((e) => FailedItem.fromJson(e.cast<String, dynamic>()))
        .toList();
  }

  Future<void> saveFailed(List<FailedItem> items) =>
      _writeJson('offline_failed.json', items.map((e) => e.toJson()).toList());

  Future<void> deletePhoto(String path) async {
    try {
      final f = File(path);
      if (await f.exists()) await f.delete();
    } catch (_) {}
  }
}
