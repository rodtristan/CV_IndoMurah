import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../models/attendance_model.dart';
import '../../widgets/custom_button.dart';
import '../attendance/check_in_screen.dart';
import '../attendance/history_screen.dart';

/// Home screen: shows today's attendance status and the primary
/// check-in / check-out actions.
///
/// TODO: Replace `_todayAttendance` dummy state with data fetched from
/// `ApiService.get(ApiEndpoints.attendanceToday)`.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // Dummy in-memory state representing today's attendance record.
  AttendanceModel _todayAttendance = const AttendanceModel(
    id: 'dummy-today',
    status: AttendanceStatus.notCheckedIn,
  );

  Future<void> _goToCheckInOut({required bool isCheckIn}) async {
    final result = await Navigator.of(context).push<AttendanceModel>(
      MaterialPageRoute(
        builder: (_) => CheckInScreen(isCheckIn: isCheckIn),
      ),
    );

    if (result != null) {
      setState(() => _todayAttendance = result);
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = _todayAttendance.status;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.home),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            tooltip: AppStrings.history,
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const HistoryScreen()),
              );
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              _StatusCard(attendance: _todayAttendance),
              const SizedBox(height: 24),
              Text(
                DateFormat('EEEE, d MMMM y').format(DateTime.now()),
                textAlign: TextAlign.center,
                style: const TextStyle(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              CustomButton(
                label: AppStrings.checkIn,
                icon: Icons.login,
                color: AppColors.success,
                onPressed: status == AttendanceStatus.notCheckedIn
                    ? () => _goToCheckInOut(isCheckIn: true)
                    : null,
              ),
              const SizedBox(height: 12),
              CustomButton(
                label: AppStrings.checkOut,
                icon: Icons.logout,
                color: AppColors.secondary,
                onPressed: status == AttendanceStatus.checkedIn
                    ? () => _goToCheckInOut(isCheckIn: false)
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatusCard extends StatelessWidget {
  final AttendanceModel attendance;

  const _StatusCard({required this.attendance});

  String _statusText() {
    switch (attendance.status) {
      case AttendanceStatus.notCheckedIn:
        return AppStrings.notCheckedInYet;
      case AttendanceStatus.checkedIn:
        return AppStrings.alreadyCheckedIn;
      case AttendanceStatus.checkedOut:
        return AppStrings.alreadyCheckedOut;
    }
  }

  Color _statusColor() {
    switch (attendance.status) {
      case AttendanceStatus.notCheckedIn:
        return AppColors.notYetCheckedIn;
      case AttendanceStatus.checkedIn:
        return AppColors.checkedIn;
      case AttendanceStatus.checkedOut:
        return AppColors.checkedOut;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            const Text(
              AppStrings.todayStatus,
              style: TextStyle(fontSize: 14, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            Text(
              _statusText(),
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: _statusColor(),
              ),
            ),
            if (attendance.checkInTime != null) ...[
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  _TimeChip(label: 'Masuk', time: attendance.checkInTime),
                  _TimeChip(label: 'Pulang', time: attendance.checkOutTime),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _TimeChip extends StatelessWidget {
  final String label;
  final DateTime? time;

  const _TimeChip({required this.label, required this.time});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
        Text(
          time != null ? DateFormat('HH:mm').format(time!) : '-',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ],
    );
  }
}
