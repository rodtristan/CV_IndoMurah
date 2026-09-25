import 'dart:typed_data';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../core/constants/app_colors.dart';
import '../core/utils/wib.dart';
import '../models/absensi_models.dart';
import '../services/api_client.dart';
import '../services/app_controller.dart';
import '../services/location_service.dart';
import '../services/photo_service.dart';
import 'widgets.dart';

enum _Step { locating, locationError, ready, processing, preview, submitting }

/// Clock in / clock out flow:
///  1. fresh high-accuracy GPS fix, validated (GPS on, not mocked, accuracy,
///     geofence against cached office locations)
///  2. selfie with the front camera (no gallery)
///  3. watermark burned into the photo, preview
///  4. submit online, or save to the offline queue
class ClockPage extends StatefulWidget {
  const ClockPage({super.key, required this.kind});

  final ClockKind kind;

  @override
  State<ClockPage> createState() => _ClockPageState();
}

class _ClockPageState extends State<ClockPage> {
  final _c = AppController.instance;

  _Step _step = _Step.locating;
  String? _error;
  bool _errorIsPermission = false;

  Position? _pos;
  GeofenceResult _geo = GeofenceResult.none;

  Uint8List? _raw;
  Uint8List? _stamped;
  DateTime? _capturedAt;
  bool _offlineMode = false;
  StampInfo? _stampInfo;

  String get _title =>
      widget.kind == ClockKind.clockIn ? 'ABSEN MASUK' : 'ABSEN PULANG';

  @override
  void initState() {
    super.initState();
    _locate();
  }

  Future<void> _locate() async {
    setState(() {
      _step = _Step.locating;
      _error = null;
      _errorIsPermission = false;
    });
    final me = _c.me;
    if (me == null) {
      return _fail('Data karyawan belum dimuat. Hubungkan internet lalu muat ulang.');
    }
    if (me.locations.isEmpty) {
      return _fail('Belum ada lokasi kantor untuk Anda. Hubungi HRD.');
    }

    Position p;
    try {
      p = await LocationService.instance.currentPosition();
    } on LocationServiceException catch (e) {
      _errorIsPermission = true;
      return _fail(e.message);
    }

    if (p.isMocked) {
      return _fail('Terdeteksi lokasi palsu (Fake GPS / Mock Location). '
          'Matikan aplikasi lokasi palsu lalu coba lagi.');
    }
    final maxAcc = me.rules.maxGpsAccuracyMeters;
    if (p.accuracy > maxAcc) {
      return _fail('Sinyal GPS lemah (akurasi ${p.accuracy.round()} m, maksimal '
          '${maxAcc.round()} m). Pindah ke tempat terbuka / dekat jendela lalu coba lagi.');
    }
    final g = LocationService.check(me.locations, p.latitude, p.longitude);
    if (!g.inside) {
      return _fail('Anda berada ${g.distanceMeters?.round()} m dari '
          '${g.office?.name ?? 'kantor'}. Absensi hanya bisa dalam radius '
          '${g.office?.radiusMeters ?? 0} m.');
    }

    if (!mounted) return;
    setState(() {
      _pos = p;
      _geo = g;
      _step = _Step.ready;
    });
    _takePhoto();
  }

  void _fail(String msg) {
    if (!mounted) return;
    setState(() {
      _error = msg;
      _step = _Step.locationError;
    });
  }

  Future<void> _takePhoto() async {
    Uint8List? raw;
    try {
      raw = await PhotoService.instance.takeSelfie();
    } catch (e) {
      if (mounted) {
        showSnack(context, 'Kamera tidak dapat dibuka. Pastikan izin kamera diberikan.',
            error: true);
      }
      return;
    }
    if (raw == null || !mounted) return; // cancelled, stay on "ready"

    final capturedAt = DateTime.now();
    final conn = await Connectivity().checkConnectivity();
    final offline = !conn.any((r) => r != ConnectivityResult.none);

    final me = _c.me!;
    final p = _pos!;
    final info = StampInfo(
      title: _title,
      capturedAt: capturedAt,
      latitude: p.latitude,
      longitude: p.longitude,
      accuracy: p.accuracy,
      officeName: _geo.office?.name ?? '-',
      distanceMeters: _geo.distanceMeters,
      employeeName: me.employee.name,
    );

    setState(() => _step = _Step.processing);
    try {
      final stamped =
          await PhotoService.instance.stamp(raw, info, offline: offline);
      if (!mounted) return;
      setState(() {
        _raw = raw;
        _stamped = stamped;
        _capturedAt = capturedAt;
        _offlineMode = offline;
        _stampInfo = info;
        _step = _Step.preview;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _step = _Step.ready);
      showSnack(context, 'Gagal memproses foto: $e', error: true);
    }
  }

  Future<void> _submit() async {
    final raw = _raw, info = _stampInfo, p = _pos, at = _capturedAt;
    if (raw == null || info == null || p == null || at == null) return;

    // A stale GPS fix / photo should not be submitted.
    if (DateTime.now().difference(at) > const Duration(minutes: 10)) {
      showSnack(context, 'Foto sudah lebih dari 10 menit. Silakan ulangi.', error: true);
      return _locate();
    }

    setState(() => _step = _Step.submitting);
    try {
      final result = await _c.submitClock(
        kind: widget.kind,
        stamper: (offline) async {
          if (offline == _offlineMode && _stamped != null) return _stamped!;
          return PhotoService.instance.stamp(raw, info, offline: offline);
        },
        latitude: p.latitude,
        longitude: p.longitude,
        accuracy: p.accuracy,
        isMocked: p.isMocked,
        capturedAt: at,
        officeName: _geo.office?.name ?? '-',
        preferOffline: _offlineMode,
      );
      if (mounted) Navigator.of(context).pop(result);
    } on UnauthorizedException {
      // AppController already returned to the login screen.
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _step = _Step.preview);
      await showDialog<void>(
        context: context,
        builder: (ctx) => AlertDialog(
          title: Text('${widget.kind.label} gagal'),
          content: Text(e.message),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('OK')),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _step = _Step.preview);
      showSnack(context, 'Terjadi kesalahan: $e', error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final busy = _step == _Step.processing || _step == _Step.submitting;
    return PopScope(
      canPop: !busy,
      child: Scaffold(
        appBar: AppBar(title: Text(widget.kind.label)),
        body: SafeArea(child: _body()),
      ),
    );
  }

  Widget _body() {
    switch (_step) {
      case _Step.locating:
        return const _Busy('Mengambil lokasi GPS...\nTunggu sebentar.');
      case _Step.processing:
        return const _Busy('Memproses foto...');
      case _Step.submitting:
        return _Busy(_offlineMode
            ? 'Menyimpan absensi offline...'
            : 'Mengirim absensi ke server...');
      case _Step.locationError:
        return _errorView();
      case _Step.ready:
        return _readyView();
      case _Step.preview:
        return _previewView();
    }
  }

  Widget _errorView() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        const SizedBox(height: 20),
        const Icon(Icons.location_off, size: 72, color: AppColors.error),
        const SizedBox(height: 16),
        Text(
          _error ?? 'Terjadi kesalahan.',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 16),
        ),
        const SizedBox(height: 24),
        FilledButton.icon(
          onPressed: _locate,
          icon: const Icon(Icons.refresh),
          label: const Text('Coba lagi'),
        ),
        if (_errorIsPermission) ...[
          const SizedBox(height: 8),
          OutlinedButton(
            onPressed: () => LocationService.instance.openLocationSettings(),
            child: const Text('Buka pengaturan lokasi'),
          ),
          TextButton(
            onPressed: () => LocationService.instance.openSettings(),
            child: const Text('Buka pengaturan izin aplikasi'),
          ),
        ],
      ],
    );
  }

  Widget _readyView() {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        InfoBox(
          color: AppColors.success,
          icon: Icons.check_circle_outline,
          text: 'Lokasi OK: ${_geo.office?.name ?? '-'} '
              '(${_geo.distanceMeters?.round() ?? 0} m, akurasi ${_pos?.accuracy.round() ?? 0} m)',
        ),
        const SizedBox(height: 32),
        const Icon(Icons.face_retouching_natural, size: 96, color: AppColors.primary),
        const SizedBox(height: 12),
        const Text(
          'Ambil foto selfie dengan kamera depan.\nPastikan wajah terlihat jelas.',
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 16),
        ),
        const SizedBox(height: 24),
        SizedBox(
          height: 56,
          child: FilledButton.icon(
            onPressed: _takePhoto,
            icon: const Icon(Icons.camera_alt),
            label: const Text('Ambil Selfie', style: TextStyle(fontSize: 18)),
          ),
        ),
      ],
    );
  }

  Widget _previewView() {
    final at = _capturedAt!;
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        if (_offlineMode) ...[
          const InfoBox(
            icon: Icons.wifi_off,
            text: 'Tidak ada internet. Absensi akan disimpan OFFLINE di HP dan '
                'dikirim otomatis saat internet tersedia (maksimal 72 jam).',
          ),
          const SizedBox(height: 12),
        ],
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: Image.memory(_stamped!, fit: BoxFit.contain, gaplessPlayback: true),
        ),
        const SizedBox(height: 12),
        Text(
          '${widget.kind.label} - ${Wib.longDate(at)}, ${Wib.timeSec(at)} WIB',
          textAlign: TextAlign.center,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 16),
        Row(children: [
          Expanded(
            child: SizedBox(
              height: 52,
              child: OutlinedButton.icon(
                onPressed: _locate,
                icon: const Icon(Icons.replay),
                label: const Text('Ulangi'),
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: SizedBox(
              height: 52,
              child: FilledButton.icon(
                onPressed: _submit,
                icon: const Icon(Icons.send),
                label: Text(
                  _offlineMode ? 'Simpan Offline' : 'Kirim ${widget.kind.label}',
                  style: const TextStyle(fontSize: 16),
                ),
              ),
            ),
          ),
        ]),
      ],
    );
  }
}

class _Busy extends StatelessWidget {
  const _Busy(this.text);
  final String text;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(text, textAlign: TextAlign.center),
        ],
      ),
    );
  }
}
