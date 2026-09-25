import 'dart:math' as math;

import 'package:intl/intl.dart';

/// Helpers for Asia/Jakarta time (WIB = UTC+7, no daylight saving) and
/// distance calculation. The office runs on WIB regardless of the phone's
/// own timezone setting.
class Wib {
  Wib._();

  static const Duration offset = Duration(hours: 7);

  /// Returns a DateTime whose *fields* are WIB wall-clock values. Only use the
  /// result for formatting / date comparison, never for arithmetic with
  /// other local DateTimes.
  static DateTime toWib(DateTime t) => t.toUtc().add(offset);

  static DateTime now() => toWib(DateTime.now());

  /// `YYYY-MM-DD` WIB date.
  static String dateKey(DateTime t) => DateFormat('yyyy-MM-dd').format(toWib(t));

  static String todayKey() => dateKey(DateTime.now());

  static String time(DateTime? t) =>
      t == null ? '--:--' : DateFormat('HH:mm').format(toWib(t));

  static String timeSec(DateTime t) => DateFormat('HH:mm:ss').format(toWib(t));

  /// e.g. "Kamis, 25 September 2026"
  static String longDate(DateTime t) =>
      DateFormat('EEEE, d MMMM y', 'id_ID').format(toWib(t));

  /// e.g. "25 Sep 2026 08:01"
  static String shortDateTime(DateTime t) =>
      DateFormat('d MMM y HH:mm', 'id_ID').format(toWib(t));

  /// Formats a `YYYY-MM-DD` key as "Kam, 25 Sep".
  static String dayLabel(String dateKey) {
    final d = DateTime.tryParse(dateKey);
    if (d == null) return dateKey;
    return DateFormat('EEE, d MMM', 'id_ID').format(d);
  }
}

/// Great-circle distance in meters between two coordinates (haversine).
double haversineMeters(double lat1, double lng1, double lat2, double lng2) {
  const r = 6371000.0;
  double rad(double d) => d * math.pi / 180;
  final dLat = rad(lat2 - lat1);
  final dLng = rad(lng2 - lng1);
  final a = math.sin(dLat / 2) * math.sin(dLat / 2) +
      math.cos(rad(lat1)) *
          math.cos(rad(lat2)) *
          math.sin(dLng / 2) *
          math.sin(dLng / 2);
  return 2 * r * math.atan2(math.sqrt(a), math.sqrt(1 - a));
}
