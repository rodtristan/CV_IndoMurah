import 'package:flutter/material.dart';

import '../core/constants/app_colors.dart';
import '../models/absensi_models.dart';

/// Small rounded label, e.g. "OFFLINE" or "Menunggu sinkron".
class Pill extends StatelessWidget {
  const Pill(this.text, {super.key, this.color = AppColors.warning, this.icon});

  final String text;
  final Color color;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.6)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 13, color: color),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: TextStyle(
                fontSize: 11, fontWeight: FontWeight.w600, color: color),
          ),
        ],
      ),
    );
  }
}

Color statusColor(AttendanceStatus? s) {
  if (s == null) return AppColors.textSecondary;
  final hex = s.color;
  if (hex != null) {
    final clean = hex.replaceAll('#', '');
    final v = int.tryParse(clean.length == 6 ? 'FF$clean' : clean, radix: 16);
    if (v != null) return Color(v);
  }
  switch (s.code) {
    case 'PRESENT':
      return AppColors.success;
    case 'LATE':
      return AppColors.warning;
    default:
      return AppColors.textSecondary;
  }
}

String statusLabel(AttendanceStatus? s) {
  if (s == null) return '-';
  switch (s.code) {
    case 'PRESENT':
      return 'Hadir';
    case 'LATE':
      return 'Terlambat';
  }
  return s.name.isNotEmpty ? s.name : s.code;
}

/// Simple colored message box.
class InfoBox extends StatelessWidget {
  const InfoBox({
    super.key,
    required this.text,
    this.color = AppColors.warning,
    this.icon = Icons.info_outline,
  });

  final String text;
  final Color color;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(text, style: const TextStyle(fontSize: 13.5))),
        ],
      ),
    );
  }
}

void showSnack(BuildContext context, String msg, {bool error = false}) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      content: Text(msg),
      backgroundColor: error ? AppColors.error : null,
      duration: Duration(seconds: error ? 5 : 3),
    ));
}
