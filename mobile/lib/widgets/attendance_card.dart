import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../core/constants/app_colors.dart';
import '../models/attendance_model.dart';

/// Displays a single attendance record (used in the history list and
/// could also be reused on the home screen).
class AttendanceCard extends StatelessWidget {
  final AttendanceModel attendance;

  const AttendanceCard({super.key, required this.attendance});

  String _formatTime(DateTime? time) {
    if (time == null) return '-';
    return DateFormat('HH:mm').format(time);
  }

  String _formatDate(DateTime? time) {
    if (time == null) return '-';
    return DateFormat('EEEE, d MMMM y', 'id_ID').format(time);
  }

  Color _statusColor() {
    switch (attendance.status) {
      case AttendanceStatus.checkedIn:
        return AppColors.checkedIn;
      case AttendanceStatus.checkedOut:
        return AppColors.checkedOut;
      case AttendanceStatus.notCheckedIn:
        return AppColors.notYetCheckedIn;
    }
  }

  String _statusLabel() {
    switch (attendance.status) {
      case AttendanceStatus.checkedIn:
        return 'Sudah Masuk';
      case AttendanceStatus.checkedOut:
        return 'Sudah Pulang';
      case AttendanceStatus.notCheckedIn:
        return 'Belum Absen';
    }
  }

  @override
  Widget build(BuildContext context) {
    final referenceDate = attendance.checkInTime ?? attendance.checkOutTime;

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      elevation: 1,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    _formatDate(referenceDate),
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _statusColor().withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    _statusLabel(),
                    style: TextStyle(
                      color: _statusColor(),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: _TimeInfo(label: 'Masuk', time: _formatTime(attendance.checkInTime)),
                ),
                Expanded(
                  child: _TimeInfo(label: 'Pulang', time: _formatTime(attendance.checkOutTime)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _TimeInfo extends StatelessWidget {
  final String label;
  final String time;

  const _TimeInfo({required this.label, required this.time});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 12)),
        const SizedBox(height: 2),
        Text(time, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
      ],
    );
  }
}
