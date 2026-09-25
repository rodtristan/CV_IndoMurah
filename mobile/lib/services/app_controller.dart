import 'dart:async';
import 'dart:io';
import 'dart:math';
import 'dart:typed_data';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/widgets.dart';

import '../core/utils/wib.dart';
import '../models/absensi_models.dart';
import 'api_client.dart';
import 'local_store.dart';

enum AuthState { unknown, loggedOut, loggedIn }

/// What the home screen shows for today, merging the server state with
/// offline entries that are still waiting in the queue.
class TodayView {
  final DateTime? checkIn;
  final DateTime? checkOut;
  final bool checkInPending;
  final bool checkOutPending;
  final bool checkInOffline;
  final bool checkOutOffline;
  final AttendanceStatus? status;

  const TodayView({
    this.checkIn,
    this.checkOut,
    this.checkInPending = false,
    this.checkOutPending = false,
    this.checkInOffline = false,
    this.checkOutOffline = false,
    this.status,
  });

  bool get hasCheckIn => checkIn != null;
  bool get hasCheckOut => checkOut != null;

  /// Which button to show: clock in, clock out, or none (done for today).
  ClockKind? get nextAction {
    if (!hasCheckIn) return ClockKind.clockIn;
    if (!hasCheckOut) return ClockKind.clockOut;
    return null;
  }
}

enum SubmitMode { online, offline }

class SubmitResult {
  final SubmitMode mode;
  final String message;
  const SubmitResult(this.mode, this.message);
}

/// Creates the watermarked JPEG. `offline` toggles the "OFFLINE" label so the
/// controller can re-stamp if an online attempt falls back to offline.
typedef PhotoStamper = Future<Uint8List> Function(bool offline);

/// Single app-wide state holder (ChangeNotifier, no extra state library).
class AppController extends ChangeNotifier with WidgetsBindingObserver {
  AppController._();
  static final AppController instance = AppController._();

  final LocalStore _store = LocalStore.instance;
  late final ApiClient api = ApiClient(
    tokenProvider: _store.readToken,
    onUnauthorized: _handleUnauthorized,
  );

  AuthState authState = AuthState.unknown;
  MeData? me;
  bool online = true;
  bool refreshing = false;
  bool syncing = false;
  List<OfflineItem> queue = [];
  List<FailedItem> failed = [];

  /// Set when the session expired; shown once on the login screen.
  String? sessionMessage;

  StreamSubscription<List<ConnectivityResult>>? _connSub;
  bool _started = false;

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  Future<void> init() async {
    if (!_started) {
      _started = true;
      WidgetsBinding.instance.addObserver(this);
      _connSub = Connectivity().onConnectivityChanged.listen(_onConnectivity);
      try {
        _setOnline(await Connectivity().checkConnectivity());
      } catch (_) {}
    }

    queue = await _store.readQueue();
    failed = await _store.readFailed();
    final token = await _store.readToken();
    if (token == null || token.isEmpty) {
      authState = AuthState.loggedOut;
      notifyListeners();
      return;
    }
    // Show cached data immediately (works offline), then refresh.
    me = await _store.readMe();
    authState = AuthState.loggedIn;
    notifyListeners();
    unawaited(refreshMe().then((_) => syncQueue()));
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed &&
        authState == AuthState.loggedIn) {
      unawaited(refreshMe().then((_) => syncQueue()));
    }
  }

  void _onConnectivity(List<ConnectivityResult> results) {
    final wasOnline = online;
    _setOnline(results);
    notifyListeners();
    if (!wasOnline && online && authState == AuthState.loggedIn) {
      unawaited(syncQueue().then((_) => refreshMe()));
    }
  }

  void _setOnline(List<ConnectivityResult> results) {
    online = results.any((r) => r != ConnectivityResult.none);
  }

  @override
  void dispose() {
    _connSub?.cancel();
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // Auth
  // ---------------------------------------------------------------------------

  Future<void> login(String username, String password) async {
    final res = await api.login(username.trim(), password);
    await _store.saveToken(res.token);
    await _store.saveMe(res.me);
    me = res.me;
    sessionMessage = null;
    online = true;

    // Offline entries belong to one employee; drop entries of someone else.
    final others =
        queue.where((q) => q.employeeId != res.me.employee.id).toList();
    if (others.isNotEmpty) {
      for (final o in others) {
        await _store.deletePhoto(o.photoPath);
      }
      queue.removeWhere((q) => q.employeeId != res.me.employee.id);
      await _store.saveQueue(queue);
      failed = [];
      await _store.saveFailed(failed);
    }

    authState = AuthState.loggedIn;
    notifyListeners();
    unawaited(syncQueue());
  }

  /// Explicit logout: removes token, cache and any unsynced offline entries.
  Future<void> logout() async {
    for (final q in queue) {
      await _store.deletePhoto(q.photoPath);
    }
    queue = [];
    failed = [];
    await _store.saveQueue(queue);
    await _store.saveFailed(failed);
    await _store.clearToken();
    await _store.clearMe();
    me = null;
    authState = AuthState.loggedOut;
    notifyListeners();
  }

  /// 401 anywhere: back to login. The offline queue is kept so it can still be
  /// synced after the same employee logs in again.
  void _handleUnauthorized() {
    if (authState != AuthState.loggedIn) return;
    sessionMessage = 'Sesi Anda telah berakhir. Silakan login kembali.';
    authState = AuthState.loggedOut;
    me = null;
    unawaited(_store.clearToken());
    unawaited(_store.clearMe());
    notifyListeners();
  }

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------

  /// Returns an error message, or null on success.
  Future<String?> refreshMe() async {
    if (authState != AuthState.loggedIn) return null;
    refreshing = true;
    notifyListeners();
    try {
      final fresh = await api.me();
      me = fresh;
      online = true;
      await _store.saveMe(fresh);
      return null;
    } on NetworkException catch (e) {
      online = false;
      return e.message;
    } on ApiException catch (e) {
      return e.message;
    } catch (e) {
      return 'Gagal memuat data: $e';
    } finally {
      refreshing = false;
      notifyListeners();
    }
  }

  /// Difference between server and phone clock at last refresh (server - phone).
  Duration? get clockSkew {
    final m = me;
    if (m == null || m.serverTime == null) return null;
    return m.serverTime!.difference(m.fetchedAt);
  }

  TodayView get today {
    final todayKey = Wib.todayKey();
    final t = me?.today;
    final server = (t != null && t.date == todayKey) ? t : null;
    final empId = me?.employee.id;

    OfflineItem? pending(ClockKind k) {
      for (final q in queue) {
        if (q.kind == k &&
            q.employeeId == empId &&
            Wib.dateKey(q.capturedAt) == todayKey) {
          return q;
        }
      }
      return null;
    }

    final pIn = server?.checkIn == null ? pending(ClockKind.clockIn) : null;
    final pOut = server?.checkOut == null ? pending(ClockKind.clockOut) : null;
    return TodayView(
      checkIn: server?.checkIn ?? pIn?.capturedAt,
      checkOut: server?.checkOut ?? pOut?.capturedAt,
      checkInPending: pIn != null,
      checkOutPending: pOut != null,
      checkInOffline: (server?.checkInOffline ?? false) || pIn != null,
      checkOutOffline: (server?.checkOutOffline ?? false) || pOut != null,
      status: server?.status,
    );
  }

  // ---------------------------------------------------------------------------
  // Clock in / out
  // ---------------------------------------------------------------------------

  /// Sends a clock in/out. Tries online first (unless [preferOffline]); on a
  /// network problem it falls back to the offline queue automatically.
  /// Throws [ApiException] when the server rejects it (message is shown).
  Future<SubmitResult> submitClock({
    required ClockKind kind,
    required PhotoStamper stamper,
    required double latitude,
    required double longitude,
    required double accuracy,
    required bool isMocked,
    required DateTime capturedAt,
    required String officeName,
    required bool preferOffline,
  }) async {
    final m = me;
    if (m == null) throw const ApiException(0, 'Data karyawan belum dimuat.');

    // Older offline entries must reach the server first (clock-in before
    // clock-out), so try to flush the queue before an online submit.
    if (!preferOffline && queue.isNotEmpty) {
      await syncQueue();
    }

    if (!preferOffline && queue.isEmpty) {
      final bytes = await stamper(false);
      final tmp = await _writePhoto(bytes, prefix: 'online');
      try {
        final att = await api.clock(
          kind: kind,
          photoPath: tmp.path,
          latitude: latitude,
          longitude: longitude,
          accuracy: accuracy,
          isMocked: isMocked,
          offline: false,
          capturedAt: capturedAt,
        );
        me = m.copyWith(today: att);
        online = true;
        await _store.saveMe(me!);
        notifyListeners();
        unawaited(refreshMe());
        return SubmitResult(
          SubmitMode.online,
          '${kind.label} berhasil pukul ${Wib.time(kind == ClockKind.clockIn ? att.checkIn : att.checkOut)} WIB.',
        );
      } on NetworkException {
        online = false; // fall through to offline below
      } on ApiException catch (e) {
        if (e.statusCode < 500) {
          if (e.statusCode == 409) unawaited(refreshMe());
          rethrow;
        }
        // 5xx: server problem -> keep it offline and retry later.
      } finally {
        await _store.deletePhoto(tmp.path);
      }
    }

    // ---- offline ----
    final bytes = await stamper(true);
    final file = await _writePhoto(bytes, prefix: kind.key);
    final item = OfflineItem(
      id: _newId(),
      employeeId: m.employee.id,
      kind: kind,
      latitude: latitude,
      longitude: longitude,
      accuracy: accuracy,
      isMocked: isMocked,
      capturedAt: capturedAt,
      photoPath: file.path,
      officeName: officeName,
    );
    queue = [...queue, item];
    await _store.saveQueue(queue);
    notifyListeners();
    return SubmitResult(
      SubmitMode.offline,
      '${kind.label} disimpan OFFLINE pukul ${Wib.time(capturedAt)} WIB. '
      'Data akan dikirim otomatis saat internet tersedia.',
    );
  }

  Future<File> _writePhoto(Uint8List bytes, {required String prefix}) async {
    final dir = await _store.photosDir();
    final f = File('${dir.path}${Platform.pathSeparator}${prefix}_${_newId()}.jpg');
    await f.writeAsBytes(bytes, flush: true);
    return f;
  }

  String _newId() =>
      '${DateTime.now().microsecondsSinceEpoch}${Random().nextInt(1 << 20)}';

  // ---------------------------------------------------------------------------
  // Offline sync
  // ---------------------------------------------------------------------------

  /// Sends queued offline entries FIFO. Returns a short summary or null.
  Future<String?> syncQueue() async {
    if (syncing || authState != AuthState.loggedIn || queue.isEmpty) {
      return null;
    }
    syncing = true;
    notifyListeners();

    var sent = 0;
    var rejected = 0;
    String? stopReason;
    try {
      final ordered = [...queue]..sort((a, b) {
          final c = a.capturedAt.compareTo(b.capturedAt);
          if (c != 0) return c;
          return a.kind.index.compareTo(b.kind.index); // in before out
        });

      for (final item in ordered) {
        if (authState != AuthState.loggedIn) break;
        if (me != null && item.employeeId != me!.employee.id) {
          await _removeItem(item);
          continue;
        }
        if (!await File(item.photoPath).exists()) {
          await _removeItem(item,
              failMessage: 'Foto absensi offline tidak ditemukan di HP.');
          rejected++;
          continue;
        }
        try {
          await api.clock(
            kind: item.kind,
            photoPath: item.photoPath,
            latitude: item.latitude,
            longitude: item.longitude,
            accuracy: item.accuracy,
            isMocked: item.isMocked,
            offline: true,
            capturedAt: item.capturedAt,
          );
          await _removeItem(item);
          sent++;
          online = true;
        } on UnauthorizedException {
          stopReason = 'Sesi berakhir.';
          break;
        } on NetworkException catch (e) {
          online = false;
          stopReason = e.message;
          break;
        } on ApiException catch (e) {
          if (e.statusCode == 409) {
            await _removeItem(item); // already recorded on the server
            sent++;
          } else if (e.statusCode >= 400 && e.statusCode < 500 && e.statusCode != 408 && e.statusCode != 429) {
            // 408/429 (timeout / rate limit) are transient: keep the item and retry later.
            await _removeItem(item, failMessage: e.message);
            rejected++;
          } else {
            stopReason = e.message; // 5xx: keep and retry later
            break;
          }
        }
      }
    } finally {
      syncing = false;
      notifyListeners();
    }

    if (sent > 0 || rejected > 0) unawaited(refreshMe());

    final parts = <String>[
      if (sent > 0) '$sent data terkirim',
      if (rejected > 0) '$rejected data ditolak server',
      if (stopReason != null) 'tertunda: $stopReason',
    ];
    return parts.isEmpty ? null : parts.join(', ');
  }

  Future<void> _removeItem(OfflineItem item, {String? failMessage}) async {
    queue = queue.where((q) => q.id != item.id).toList();
    await _store.saveQueue(queue);
    await _store.deletePhoto(item.photoPath);
    if (failMessage != null) {
      failed = [
        FailedItem(
          id: item.id,
          kind: item.kind,
          capturedAt: item.capturedAt,
          message: failMessage,
          failedAt: DateTime.now(),
        ),
        ...failed,
      ];
      await _store.saveFailed(failed);
    }
    notifyListeners();
  }

  Future<void> dismissFailed(String id) async {
    failed = failed.where((f) => f.id != id).toList();
    await _store.saveFailed(failed);
    notifyListeners();
  }

  Future<void> clearFailed() async {
    failed = [];
    await _store.saveFailed(failed);
    notifyListeners();
  }
}
