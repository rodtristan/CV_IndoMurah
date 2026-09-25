import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../core/constants/app_colors.dart';
import '../core/utils/wib.dart';
import '../models/absensi_models.dart';
import '../services/api_client.dart';
import '../services/app_controller.dart';
import 'widgets.dart';

class HistoryPage extends StatefulWidget {
  const HistoryPage({super.key, required this.active});

  final bool active;

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  late DateTime _month; // first day of month (WIB fields)
  List<Attendance>? _items;
  String? _error;
  bool _loading = false;
  bool _loadedOnce = false;

  @override
  void initState() {
    super.initState();
    final now = Wib.now();
    _month = DateTime(now.year, now.month);
    if (widget.active) _load();
  }

  @override
  void didUpdateWidget(covariant HistoryPage old) {
    super.didUpdateWidget(old);
    if (widget.active && !old.active) _load();
  }

  String get _monthKey => DateFormat('yyyy-MM').format(_month);

  bool get _isCurrentMonth {
    final now = Wib.now();
    return _month.year == now.year && _month.month == now.month;
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final items = await AppController.instance.api.history(_monthKey);
      items.sort((a, b) => b.date.compareTo(a.date));
      _items = items;
      _loadedOnce = true;
    } on NetworkException catch (e) {
      _error = '${e.message}\nRiwayat hanya bisa dilihat saat online.';
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = 'Gagal memuat riwayat: $e';
    }
    if (mounted) setState(() => _loading = false);
  }

  void _shift(int delta) {
    setState(() {
      _month = DateTime(_month.year, _month.month + delta);
      _items = null;
    });
    _load();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Riwayat Absensi')),
      body: Column(
        children: [
          Material(
            color: AppColors.surface,
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.chevron_left),
                  tooltip: 'Bulan sebelumnya',
                  onPressed: _loading ? null : () => _shift(-1),
                ),
                Expanded(
                  child: Text(
                    DateFormat('MMMM y', 'id_ID').format(_month),
                    textAlign: TextAlign.center,
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.chevron_right),
                  tooltip: 'Bulan berikutnya',
                  onPressed: _loading || _isCurrentMonth ? null : () => _shift(1),
                ),
              ],
            ),
          ),
          if (_loading) const LinearProgressIndicator(minHeight: 2),
          Expanded(
            child: RefreshIndicator(onRefresh: _load, child: _list()),
          ),
        ],
      ),
    );
  }

  Widget _list() {
    if (_error != null) {
      return ListView(padding: const EdgeInsets.all(24), children: [
        const SizedBox(height: 40),
        const Icon(Icons.cloud_off, size: 56, color: AppColors.textSecondary),
        const SizedBox(height: 12),
        Text(_error!, textAlign: TextAlign.center),
        const SizedBox(height: 12),
        Center(child: OutlinedButton(onPressed: _load, child: const Text('Coba lagi'))),
      ]);
    }
    final items = _items;
    if (items == null) {
      return ListView(children: [if (!_loadedOnce && !_loading) const SizedBox()]);
    }
    if (items.isEmpty) {
      return ListView(padding: const EdgeInsets.all(24), children: const [
        SizedBox(height: 40),
        Text('Belum ada absensi di bulan ini.', textAlign: TextAlign.center),
      ]);
    }
    return ListView.separated(
      padding: const EdgeInsets.all(12),
      itemCount: items.length,
      separatorBuilder: (_, _) => const SizedBox(height: 8),
      itemBuilder: (_, i) => _tile(items[i]),
    );
  }

  Widget _tile(Attendance a) {
    final color = statusColor(a.status);
    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            Container(width: 5, height: 56, decoration: BoxDecoration(
              color: color, borderRadius: BorderRadius.circular(4))),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(children: [
                    Text(Wib.dayLabel(a.date),
                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                    const Spacer(),
                    Pill(statusLabel(a.status), color: color),
                  ]),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 12,
                    runSpacing: 4,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      _time(Icons.login, a.checkIn, a.checkInOffline),
                      _time(Icons.logout, a.checkOut, a.checkOutOffline),
                    ],
                  ),
                  if ((a.location ?? '').isNotEmpty)
                    Padding(
                      padding: const EdgeInsets.only(top: 4),
                      child: Text(a.location!,
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _time(IconData icon, DateTime? t, bool offline) {
    return Row(mainAxisSize: MainAxisSize.min, children: [
      Icon(icon, size: 16, color: AppColors.textSecondary),
      const SizedBox(width: 4),
      Text(Wib.time(t), style: const TextStyle(fontSize: 15)),
      if (offline) ...[
        const SizedBox(width: 4),
        const Pill('Offline', color: AppColors.textSecondary),
      ],
    ]);
  }
}
