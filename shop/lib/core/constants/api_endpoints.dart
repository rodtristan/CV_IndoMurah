/// Base URL mengarah ke backend NestJS di folder `api/` (lihat main.ts:
/// global prefix `/api/v1`, default port 5000).
///
/// - Emulator Android  : ganti host jadi 10.0.2.2
/// - Simulator iOS      : localhost sudah benar
/// - HP fisik / production : ganti ke domain API sungguhan
class ApiEndpoints {
  ApiEndpoints._();

  static const String baseUrl = 'http://localhost:5000/api/v1';

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
