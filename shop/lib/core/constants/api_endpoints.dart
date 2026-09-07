/// Base URL mengarah ke backend NestJS di folder `api/` (lihat main.ts:
/// global prefix `/api/v1`, default port 5000), yang di production
/// dideploy di Railway sebagai `https://cvindomurah.up.railway.app/api/v1`.
///
/// Default-nya localhost untuk `flutter run` sehari-hari, tapi bisa
/// di-override saat build lewat `--dart-define=API_BASE_URL=...` — tanpa
/// perlu ubah kode:
///
///   - Emulator Android (API lokal): `--dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1`
///   - Simulator iOS (API lokal): default (localhost) sudah benar
///   - HP fisik (API lokal): pakai IP LAN mesin dev,
///     mis. `--dart-define=API_BASE_URL=http://192.168.x.x:5000/api/v1`
///   - Build release (API production):
///     `--dart-define=API_BASE_URL=https://cvindomurah.up.railway.app/api/v1`
///     (persis yang dipakai service `*-apk-builder` di root `docker-compose.yml`
///     — lihat `API_BASE_URL` di root `.env.example`)
class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://localhost:5000/api/v1',
  );

  // Auth
  static const String login = '$baseUrl/auth/login';
  static const String register = '$baseUrl/auth/register';
  static const String me = '$baseUrl/auth/me';

  // Catalog
  static const String categories = '$baseUrl/categories';
  static const String products = '$baseUrl/products';
  static String productDetail(String id) => '$baseUrl/products/$id';

  // Cart & Orders
  static const String cart = '$baseUrl/cart';
  static const String orders = '$baseUrl/orders';
  static String orderDetail(String id) => '$baseUrl/orders/$id';
}
