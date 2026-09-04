/// API endpoint constants.
///
/// The backend (`api` folder, sibling to `mobile`) is a NestJS service
/// exposed on port 5000 with a global `/api/v1` prefix.
///
/// NOTE: `baseUrl` below is a placeholder for local development.
///   - Android emulator: use `http://10.0.2.2:5000/api/v1` to reach host machine.
///   - iOS simulator: `http://localhost:5000/api/v1` works fine.
///   - Physical device: use your machine's LAN IP, e.g. `http://192.168.x.x:5000/api/v1`.
///   - Production: replace with the deployed API URL (consider using
///     `--dart-define=API_BASE_URL=...` or flavors instead of hardcoding).
class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = 'http://localhost:5000/api/v1';

  // Auth
  static const String login = '$baseUrl/auth/login';
  static const String logout = '$baseUrl/auth/logout';
  static const String profile = '$baseUrl/auth/me';

  // Attendance
  static const String attendanceToday = '$baseUrl/attendance/today';
  static const String attendanceCheckIn = '$baseUrl/attendance/check-in';
  static const String attendanceCheckOut = '$baseUrl/attendance/check-out';
  static const String attendanceHistory = '$baseUrl/attendance/history';
}
