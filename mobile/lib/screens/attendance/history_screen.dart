import 'package:flutter/material.dart';

import '../../core/constants/app_colors.dart';
import '../../core/constants/app_strings.dart';
import '../../models/attendance_model.dart';
import '../../widgets/attendance_card.dart';

/// Time range used to filter the attendance history list below.
enum HistoryFilter { day, week, month, year }

/// Displays a list of past attendance records, filterable by
/// day/week/month/year.
///
/// TODO: Replace `_generateDummyHistory` with data fetched from
/// `ApiService.get(ApiEndpoints.attendanceHistory)`, likely with
/// pagination + a server-side date-range filter instead of a client-side
/// one once the backend has an Attendance module.
class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key});

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  HistoryFilter _filter = HistoryFilter.week;
  late final List<AttendanceModel> _allHistory = _generateDummyHistory();

  /// ~1 year of weekday-only dummy attendance so every filter option
  /// (day/week/month/year) actually has data to show.
  List<AttendanceModel> _generateDummyHistory() {
    final now = DateTime.now();
    final records = <AttendanceModel>[];

    for (var i = 1; i <= 365; i++) {
      final day = now.subtract(Duration(days: i));
      if (day.weekday == DateTime.saturday || day.weekday == DateTime.sunday) {
        continue;
      }

      records.add(
        AttendanceModel(
          id: 'dummy-history-$i',
          checkInTime: DateTime(day.year, day.month, day.day, 8, i % 20),
          checkOutTime: DateTime(day.year, day.month, day.day, 17, (i * 3) % 30),
          checkInLat: -6.200000,
          checkInLng: 106.816666,
          status: AttendanceStatus.checkedOut,
        ),
      );
    }

    return records;
  }

  DateTime _startOfFilter(HistoryFilter filter, DateTime now) {
    switch (filter) {
      case HistoryFilter.day:
        return DateTime(now.year, now.month, now.day);
      case HistoryFilter.week:
        final monday = now.subtract(Duration(days: now.weekday - 1));
        return DateTime(monday.year, monday.month, monday.day);
      case HistoryFilter.month:
        return DateTime(now.year, now.month, 1);
      case HistoryFilter.year:
        return DateTime(now.year, 1, 1);
    }
  }

  List<AttendanceModel> get _filteredHistory {
    final now = DateTime.now();
    final start = _startOfFilter(_filter, now);

    return _allHistory.where((record) {
      final reference = record.checkInTime ?? record.checkOutTime;
      return reference != null && !reference.isBefore(start);
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final history = _filteredHistory;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(AppStrings.history),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
      ),
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: _FilterSelector(
                value: _filter,
                onChanged: (filter) => setState(() => _filter = filter),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  '${history.length} catatan',
                  style: const TextStyle(color: AppColors.textSecondary, fontSize: 12),
                ),
              ),
            ),
            Expanded(
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
          ],
        ),
      ),
    );
  }
}

class _FilterSelector extends StatelessWidget {
  final HistoryFilter value;
  final ValueChanged<HistoryFilter> onChanged;

  const _FilterSelector({required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return SegmentedButton<HistoryFilter>(
      segments: const [
        ButtonSegment(value: HistoryFilter.day, label: Text(AppStrings.filterDay)),
        ButtonSegment(value: HistoryFilter.week, label: Text(AppStrings.filterWeek)),
        ButtonSegment(value: HistoryFilter.month, label: Text(AppStrings.filterMonth)),
        ButtonSegment(value: HistoryFilter.year, label: Text(AppStrings.filterYear)),
      ],
      selected: {value},
      onSelectionChanged: (selection) => onChanged(selection.first),
      style: SegmentedButton.styleFrom(
        selectedBackgroundColor: AppColors.primary,
        selectedForegroundColor: Colors.white,
      ),
    );
  }
}
