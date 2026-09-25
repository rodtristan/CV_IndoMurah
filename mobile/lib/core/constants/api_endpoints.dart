/// API endpoint constants for the attendance mobile API.
///
/// The backend (`api/`, sibling of `mobile/`) is a NestJS service on port
/// 5000 with a global `/api/v1` prefix; production runs at
/// `https://cvindomurah.up.railway.app/api/v1`.
///
/// `baseUrl` is set at build time with `--dart-define=API_BASE_URL=...`:
///   - Android emulator (local API): `http://10.0.2.2:5000/api/v1`
///   - Physical device (local API):  `http://<LAN-IP-PC>:5000/api/v1`
///   - Production:                   `https://cvindomurah.up.railway.app/api/v1`
/// See mobile/README.md.
class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5000/api/v1',
  );

  static const String _mobile = '$baseUrl/attendance-mobile';

  static const String login = '$_mobile/login';
  static const String me = '$_mobile/me';
  static const String history = '$_mobile/history';
  static const String clockIn = '$_mobile/clock-in';
  static const String clockOut = '$_mobile/clock-out';
}

/// Shown on the profile screen. Keep in sync with `version:` in pubspec.yaml.
const String kAppVersion = '1.0.0';
