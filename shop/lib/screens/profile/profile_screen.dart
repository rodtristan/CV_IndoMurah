import 'package:flutter/material.dart';
import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../core/services/auth_storage_service.dart';
import '../../models/user_model.dart';
import '../auth/login_screen.dart';

/// Halaman akun: info user asli (dari data login) + tombol logout.
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  Future<void> _logout(BuildContext context) async {
    await AuthStorageService.instance.clear();
    if (!context.mounted) return;
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text(AppStrings.profile)),
      body: FutureBuilder<Map<String, dynamic>?>(
        future: AuthStorageService.instance.getUser(),
        builder: (context, snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const Center(child: CircularProgressIndicator());
          }

          final json = snapshot.data;
          final user = json != null ? UserModel.fromJson(json) : null;

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const CircleAvatar(
                radius: 40,
                backgroundColor: AppColors.primary,
                child: Icon(Icons.person, size: 40, color: Colors.white),
              ),
              const SizedBox(height: 12),
              Center(
                child: Text(
                  user?.fullName ?? '-',
                  style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
              Center(
                child: Text(
                  user?.email ?? '-',
                  style: const TextStyle(color: AppColors.textSecondary),
                ),
              ),
              const SizedBox(height: 24),
              _MenuTile(icon: Icons.receipt_long_outlined, label: 'Riwayat Pesanan', onTap: () {}),
              _MenuTile(icon: Icons.location_on_outlined, label: 'Alamat Tersimpan', onTap: () {}),
              _MenuTile(icon: Icons.favorite_border, label: 'Wishlist', onTap: () {}),
              _MenuTile(icon: Icons.help_outline, label: 'Bantuan', onTap: () {}),
              const SizedBox(height: 12),
              _MenuTile(icon: Icons.logout, label: 'Keluar', color: AppColors.error, onTap: () => _logout(context)),
            ],
          );
        },
      ),
    );
  }
}

class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  final Color? color;

  const _MenuTile({required this.icon, required this.label, required this.onTap, this.color});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: color ?? AppColors.textPrimary),
      title: Text(label, style: TextStyle(color: color ?? AppColors.textPrimary)),
      trailing: const Icon(Icons.chevron_right, size: 18),
      onTap: onTap,
    );
  }
}
