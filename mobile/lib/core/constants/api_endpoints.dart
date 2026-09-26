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

  /// Emulator default, used only when no `--dart-define=API_BASE_URL` is given.
  static const String devDefaultBaseUrl = 'http://10.0.2.2:5000/api/v1';

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: devDefaultBaseUrl,
  );

  /// Release builds must be given a real https API URL at build time.
  /// Returns an error message when the configuration is not usable, or
  /// `null` when it is fine. Debug/profile builds are not checked.
  static String? releaseConfigError({required bool isRelease}) {
    if (!isRelease) return null;
    if (baseUrl == devDefaultBaseUrl || baseUrl.trim().isEmpty) {
      return 'API_BASE_URL belum diatur. Build rilis wajib memakai '
          '--dart-define=API_BASE_URL=https://<server>/api/v1';
    }
    final uri = Uri.tryParse(baseUrl);
    if (uri == null || uri.scheme != 'https' || uri.host.isEmpty) {
      return 'API_BASE_URL untuk build rilis harus https:// (sekarang: $baseUrl)';
    }
    return null;
  }

  static const String _mobile = '$baseUrl/attendance-mobile';

  static const String login = '$_mobile/login';
  static const String me = '$_mobile/me';
  static const String history = '$_mobile/history';
  static const String clockIn = '$_mobile/clock-in';
  static const String clockOut = '$_mobile/clock-out';
}

/// Shown on the profile screen. Keep in sync with `version:` in pubspec.yaml.
const String kAppVersion = '1.0.0';
