import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../models/attendance_model.dart';
import '../../widgets/attendance_card.dart';

/// Displays a list of past attendance records.
///
/// TODO: Replace `_dummyHistory` with data fetched from
/// `ApiService.get(ApiEndpoints.attendanceHistory)`, likely with
/// pagination support.
class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  List<AttendanceModel> get _dummyHistory {
    final now = DateTime.now();
    return List.generate(5, (index) {
      final day = now.subtract(Duration(days: index + 1));
      return AttendanceModel(
        id: 'dummy-history-$index',
        checkInTime: DateTime(day.year, day.month, day.day, 8, 2),
        checkOutTime: DateTime(day.year, day.month, day.day, 17, 5),
        checkInLat: -6.200000,
        checkInLng: 106.816666,
        status: AttendanceStatus.checkedOut,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final history = _dummyHistory;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.history),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: history.isEmpty
            ? const Center(
                child: Text(
                  AppStrings.noHistory,
                  style: TextStyle(color: AppColors.textSecondary),
                ),
              )
            : ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 12),
                itemCount: history.length,
                itemBuilder: (context, index) {
                  return AttendanceCard(attendance: history[index]);
                },
              ),
      ),
    );
  }
}
