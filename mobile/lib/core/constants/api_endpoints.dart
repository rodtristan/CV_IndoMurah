/// API endpoint constants.
///
/// The backend (`api` folder, sibling to `mobile`) is a NestJS service
/// exposed on port 5000 with a global `/api/v1` prefix, deployed in
/// production on Railway at `https://cvindomurah.up.railway.app/api/v1`.
///
/// `baseUrl` defaults to localhost for day-to-day `flutter run`, but is
/// overridable at build time via `--dart-define=API_BASE_URL=...` — no
/// code change needed to point a build at a different backend:
///
///   - Android emulator (local API): `--dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1`
///     (localhost isn't reachable from the emulator; 10.0.2.2 maps to the host machine)
///   - iOS simulator (local API): default (`localhost`) already works
///   - Physical device (local API): use your machine's LAN IP,
///     e.g. `--dart-define=API_BASE_URL=http://192.168.x.x:5000/api/v1`
///   - Release build (production API):
///     `--dart-define=API_BASE_URL=https://cvindomurah.up.railway.app/api/v1`
///     (this is exactly what the `*-apk-builder` Docker services in the
///     root `docker-compose.yml` pass by default — see `API_BASE_URL` in
///     the root `.env.example`)
class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:5000/api/v1',
  );

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
