import 'package:flutter/material.dart';

import '../core/constants/api_endpoints.dart';
import '../core/constants/app_colors.dart';
import '../services/app_controller.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  Future<void> _logout(BuildContext context) async {
    final c = AppController.instance;
    final pending = c.queue.length;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Keluar dari aplikasi?'),
        content: Text(pending > 0
            ? 'PERHATIAN: masih ada $pending absensi offline yang BELUM terkirim. '
                'Jika keluar sekarang, data tersebut akan HILANG.\n\n'
                'Sambungkan internet dan tekan "Sinkronkan sekarang" di Beranda terlebih dahulu.'
            : 'Anda perlu login lagi untuk absen.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal')),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: Text(pending > 0 ? 'Tetap keluar' : 'Keluar'),
          ),
        ],
      ),
    );
    if (ok == true) await c.logout();
  }

  @override
  Widget build(BuildContext context) {
    final c = AppController.instance;
    return ListenableBuilder(
      listenable: c,
      builder: (context, _) {
        final me = c.me;
        final offices = me?.locations ?? const [];
        return Scaffold(
          appBar: AppBar(title: const Text('Profil')),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(children: [
                    const CircleAvatar(
                      radius: 36,
                      backgroundColor: AppColors.primary,
                      child: Icon(Icons.person, size: 40, color: Colors.white),
                    ),
                    const SizedBox(height: 12),
                    Text(me?.employee.name ?? '-',
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    Text('Kode karyawan: ${me?.employee.code ?? '-'}',
                        style: const TextStyle(color: AppColors.textSecondary)),
                  ]),
                ),
              ),
              const SizedBox(height: 12),
              Card(
                child: Column(children: [
                  for (final o in offices)
                    ListTile(
                      leading: const Icon(Icons.business),
                      title: Text(o.name),
                      subtitle: Text([
                        if ((o.address ?? '').isNotEmpty) o.address!,
                        'Jam kerja ${o.workStart} - ${o.workEnd}, radius ${o.radiusMeters} m',
                      ].join('\n')),
                      isThreeLine: (o.address ?? '').isNotEmpty,
                    ),
                  if (offices.isEmpty)
                    const ListTile(
                      leading: Icon(Icons.business),
                      title: Text('Belum ada lokasi kantor'),
                    ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.cloud_upload_outlined),
                    title: const Text('Absensi offline belum terkirim'),
                    trailing: Text('${c.queue.length}',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  ),
                  const ListTile(
                    leading: Icon(Icons.info_outline),
                    title: Text('Versi aplikasi'),
                    trailing: Text(kAppVersion),
                  ),
                ]),
              ),
              const SizedBox(height: 24),
              SizedBox(
                height: 50,
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(foregroundColor: AppColors.error),
                  onPressed: () => _logout(context),
                  icon: const Icon(Icons.logout),
                  label: const Text('Keluar'),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
