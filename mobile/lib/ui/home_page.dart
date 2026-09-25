import 'dart:async';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';

import '../core/constants/app_colors.dart';
import '../core/utils/wib.dart';
import '../models/absensi_models.dart';
import '../services/app_controller.dart';
import '../services/location_service.dart';
import 'clock_page.dart';
import 'widgets.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key, required this.active});

  /// True while this tab is visible; GPS tracking only runs when active.
  final bool active;

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> with WidgetsBindingObserver {
  final _c = AppController.instance;

  StreamSubscription<Position>? _posSub;
  Position? _pos;
  String? _locError;
  bool _locStarting = false;

  Timer? _clockTimer;
  DateTime _now = DateTime.now();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) setState(() => _now = DateTime.now());
    });
    if (widget.active) _startLocation();
  }

  @override
  void didUpdateWidget(covariant HomePage old) {
    super.didUpdateWidget(old);
    if (widget.active && !old.active) _startLocation();
    if (!widget.active && old.active) _stopLocation();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && widget.active) {
      _startLocation();
    } else if (state == AppLifecycleState.paused) {
      _stopLocation();
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _clockTimer?.cancel();
    _stopLocation();
    super.dispose();
  }

  Future<void> _startLocation() async {
    if (_posSub != null || _locStarting) return;
    _locStarting = true;
    try {
      await LocationService.instance.ensurePermission();
      _posSub = LocationService.instance.positionStream().listen(
        (p) {
          if (mounted) {
            setState(() {
              _pos = p;
              _locError = null;
            });
          }
        },
        onError: (Object e) {
          if (mounted) {
            setState(() => _locError = 'Lokasi tidak tersedia. Pastikan GPS aktif.');
          }
          _stopLocation();
        },
      );
      if (mounted) setState(() => _locError = null);
    } on LocationServiceException catch (e) {
      if (mounted) setState(() => _locError = e.message);
    } finally {
      _locStarting = false;
    }
  }

  void _stopLocation() {
    _posSub?.cancel();
    _posSub = null;
  }

  Future<void> _refresh() async {
    final err = await _c.refreshMe();
    final sync = await _c.syncQueue();
    if (!mounted) return;
    if (err != null) {
      showSnack(context, err, error: !(_c.me != null && !_c.online));
    } else if (sync != null) {
      showSnack(context, 'Sinkronisasi: $sync');
    }
    _stopLocation();
    _startLocation();
  }

  Future<void> _sync() async {
    final res = await _c.syncQueue();
    if (!mounted) return;
    showSnack(context, res == null ? 'Tidak ada data untuk dikirim.' : 'Sinkronisasi: $res');
  }

  Future<void> _openClock(ClockKind kind) async {
    _stopLocation(); // clock page takes its own fresh GPS fix
    final result = await Navigator.of(context).push<SubmitResult>(
      MaterialPageRoute(builder: (_) => ClockPage(kind: kind)),
    );
    if (!mounted) return;
    if (widget.active) _startLocation();
    if (result != null) {
      showSnack(context, result.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: _c,
      builder: (context, _) {
        final me = _c.me;
        return Scaffold(
          appBar: AppBar(
            title: const Text('Absensi'),
            actions: [
              Padding(
                padding: const EdgeInsets.only(right: 12),
                child: Center(
                  child: _c.online
                      ? const Pill('Online', color: Colors.white, icon: Icons.wifi)
                      : const Pill('Offline', color: Colors.amber, icon: Icons.wifi_off),
                ),
              ),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              children: me == null ? _noData() : _content(me),
            ),
          ),
        );
      },
    );
  }

  List<Widget> _noData() => [
        const SizedBox(height: 40),
        const Icon(Icons.cloud_off, size: 64, color: AppColors.textSecondary),
        const SizedBox(height: 12),
        Text(
          _c.refreshing
              ? 'Memuat data...'
              : 'Data belum tersedia. Hubungkan HP ke internet lalu tarik layar ke bawah untuk memuat ulang.',
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 16),
        Center(
          child: OutlinedButton.icon(
            onPressed: _c.refreshing ? null : _refresh,
            icon: const Icon(Icons.refresh),
            label: const Text('Muat ulang'),
          ),
        ),
      ];

  List<Widget> _content(MeData me) {
    final today = _c.today;
    final skew = _c.clockSkew;
    return [
      _header(me),
      const SizedBox(height: 12),
      if (!_c.online) ...[
        InfoBox(
          icon: Icons.wifi_off,
          text: 'Anda sedang OFFLINE. Absensi tetap bisa dilakukan dan akan '
              'dikirim otomatis saat internet tersedia. '
              'Data terakhir diperbarui ${Wib.shortDateTime(me.fetchedAt)}.',
        ),
        const SizedBox(height: 12),
      ],
      if (skew != null && skew.abs() > const Duration(minutes: 5)) ...[
        InfoBox(
          color: AppColors.error,
          icon: Icons.schedule,
          text: 'Jam di HP Anda berbeda ${skew.inMinutes.abs()} menit dari jam '
              'server. Atur jam HP ke otomatis agar absensi offline tidak ditolak.',
        ),
        const SizedBox(height: 12),
      ],
      _locationCard(me),
      const SizedBox(height: 12),
      _todayCard(today),
      const SizedBox(height: 16),
      _actionButton(today),
      if (_c.queue.isNotEmpty) ...[
        const SizedBox(height: 16),
        _queueCard(me),
      ],
      if (_c.failed.isNotEmpty) ...[
        const SizedBox(height: 16),
        _failedCard(),
      ],
      const SizedBox(height: 24),
    ];
  }

  Widget _header(MeData me) {
    return Card(
      color: AppColors.primary,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Halo,', style: TextStyle(color: Colors.white.withValues(alpha: 0.8))),
            Text(
              me.employee.name,
              style: const TextStyle(
                  color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Text(Wib.longDate(_now),
                style: const TextStyle(color: Colors.white, fontSize: 15)),
            Text(
              '${Wib.timeSec(_now)} WIB',
              style: const TextStyle(
                  color: Colors.white, fontSize: 28, fontWeight: FontWeight.w300),
            ),
          ],
        ),
      ),
    );
  }

  Widget _locationCard(MeData me) {
    Widget body;
    if (me.locations.isEmpty) {
      body = const Text(
        'Belum ada lokasi kantor yang ditetapkan. Hubungi HRD.',
        style: TextStyle(color: AppColors.error),
      );
    } else if (_locError != null) {
      body = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(_officeTitle(me), style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 6),
          Text(_locError!, style: const TextStyle(color: AppColors.error)),
          const SizedBox(height: 6),
          Wrap(spacing: 8, children: [
            OutlinedButton(onPressed: () {
              _stopLocation();
              _startLocation();
            }, child: const Text('Coba lagi')),
            TextButton(
              onPressed: () => LocationService.instance.openSettings(),
              child: const Text('Buka Pengaturan'),
            ),
          ]),
        ],
      );
    } else if (_pos == null) {
      body = Row(children: [
        const SizedBox(
            width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)),
        const SizedBox(width: 12),
        Expanded(child: Text('Mencari lokasi Anda...\n${_officeTitle(me)}')),
      ]);
    } else {
      final p = _pos!;
      final g = LocationService.check(me.locations, p.latitude, p.longitude);
      final dist = g.distanceMeters?.round() ?? 0;
      final color = g.inside ? AppColors.success : AppColors.error;
      body = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(g.office?.name ?? '-',
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16)),
          if ((g.office?.address ?? '').isNotEmpty)
            Text(g.office!.address!,
                style: const TextStyle(color: AppColors.textSecondary, fontSize: 12.5)),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(children: [
              Icon(g.inside ? Icons.check_circle : Icons.cancel, color: color),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  g.inside
                      ? 'Di dalam area kantor ($dist m)'
                      : 'Di luar area ($dist m, maks ${g.office?.radiusMeters ?? 0} m)',
                  style: TextStyle(color: color, fontWeight: FontWeight.w600),
                ),
              ),
            ]),
          ),
          const SizedBox(height: 6),
          Text(
            'Akurasi GPS: ${p.accuracy.round()} m'
            '${p.accuracy > me.rules.maxGpsAccuracyMeters ? ' (lemah, maks ${me.rules.maxGpsAccuracyMeters.round()} m)' : ''}',
            style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
          ),
          if (p.isMocked)
            const Padding(
              padding: EdgeInsets.only(top: 6),
              child: Text('Terdeteksi aplikasi lokasi palsu (Fake GPS). Matikan untuk bisa absen.',
                  style: TextStyle(color: AppColors.error, fontWeight: FontWeight.w600)),
            ),
        ],
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Row(children: [
              Icon(Icons.location_on_outlined, color: AppColors.primary),
              SizedBox(width: 6),
              Text('Lokasi Kantor', style: TextStyle(fontWeight: FontWeight.bold)),
            ]),
            const SizedBox(height: 10),
            body,
          ],
        ),
      ),
    );
  }

  String _officeTitle(MeData me) => me.locations.length == 1
      ? me.locations.first.name
      : '${me.locations.length} lokasi kantor diizinkan';

  Widget _todayCard(TodayView t) {
    Widget col(String label, DateTime? time, bool offline, bool pending) {
      return Expanded(
        child: Column(
          children: [
            Text(label, style: const TextStyle(color: AppColors.textSecondary)),
            const SizedBox(height: 4),
            Text(Wib.time(time),
                style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            if (pending)
              const Pill('Menunggu sinkron', icon: Icons.cloud_upload_outlined)
            else if (offline)
              const Pill('Offline', color: AppColors.textSecondary),
          ],
        ),
      );
    }

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(children: [
              const Text('Absensi Hari Ini', style: TextStyle(fontWeight: FontWeight.bold)),
              const Spacer(),
              if (t.status != null)
                Pill(statusLabel(t.status), color: statusColor(t.status))
              else if (t.checkInPending)
                const Pill('Belum terverifikasi', color: AppColors.textSecondary),
            ]),
            const SizedBox(height: 14),
            Row(children: [
              col('Masuk', t.checkIn, t.checkInOffline, t.checkInPending),
              Container(width: 1, height: 60, color: Colors.black12),
              col('Pulang', t.checkOut, t.checkOutOffline, t.checkOutPending),
            ]),
          ],
        ),
      ),
    );
  }

  Widget _actionButton(TodayView t) {
    final next = t.nextAction;
    if (next == null) {
      return const InfoBox(
        color: AppColors.success,
        icon: Icons.check_circle_outline,
        text: 'Absensi hari ini sudah lengkap. Terima kasih!',
      );
    }
    final isIn = next == ClockKind.clockIn;
    return SizedBox(
      height: 64,
      child: FilledButton.icon(
        style: FilledButton.styleFrom(
          backgroundColor: isIn ? AppColors.success : AppColors.secondary,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        ),
        onPressed: () => _openClock(next),
        icon: Icon(isIn ? Icons.login : Icons.logout, size: 28),
        label: Text(
          isIn ? 'CLOCK IN' : 'CLOCK OUT',
          style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _queueCard(MeData me) {
    final maxAge = Duration(hours: me.rules.maxOfflineAgeHours);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const Icon(Icons.cloud_upload_outlined, color: AppColors.warning),
              const SizedBox(width: 8),
              Expanded(
                child: Text('${_c.queue.length} absensi offline belum terkirim',
                    style: const TextStyle(fontWeight: FontWeight.bold)),
              ),
            ]),
            const SizedBox(height: 8),
            for (final q in _c.queue)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 2),
                child: Text(
                  '- ${q.kind.label}  ${Wib.shortDateTime(q.capturedAt)} WIB'
                  '${DateTime.now().difference(q.capturedAt) > maxAge ? '  (sudah lewat ${me.rules.maxOfflineAgeHours} jam!)' : ''}',
                  style: const TextStyle(fontSize: 13),
                ),
              ),
            const SizedBox(height: 8),
            Text(
              'Absensi offline yang lebih dari ${me.rules.maxOfflineAgeHours} jam '
              'akan DITOLAK server. Segera sambungkan internet dan sinkronkan.',
              style: const TextStyle(fontSize: 12.5, color: AppColors.error),
            ),
            const SizedBox(height: 10),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _c.syncing ? null : _sync,
                icon: _c.syncing
                    ? const SizedBox(
                        width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                    : const Icon(Icons.sync),
                label: Text(_c.syncing ? 'Mengirim...' : 'Sinkronkan sekarang'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _failedCard() {
    return Card(
      color: const Color(0xFFFFF1F1),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              const Icon(Icons.error_outline, color: AppColors.error),
              const SizedBox(width: 8),
              const Expanded(
                child: Text('Absensi offline ditolak server',
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              TextButton(onPressed: _c.clearFailed, child: const Text('Hapus semua')),
            ]),
            for (final f in _c.failed)
              ListTile(
                contentPadding: EdgeInsets.zero,
                dense: true,
                title: Text('${f.kind.label} ${Wib.shortDateTime(f.capturedAt)} WIB'),
                subtitle: Text(f.message, style: const TextStyle(color: AppColors.error)),
                trailing: IconButton(
                  icon: const Icon(Icons.close),
                  tooltip: 'Tutup',
                  onPressed: () => _c.dismissFailed(f.id),
                ),
              ),
            const Text(
              'Hubungi HRD jika absensi Anda perlu dikoreksi.',
              style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }
}
