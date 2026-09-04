/// String yang dipakai berulang di seluruh aplikasi.
/// Belum pakai i18n (flutter_localizations) — semua hardcode Bahasa Indonesia.
class AppStrings {
  AppStrings._();

  static const String appName = 'Toko CV IndoMurah';
  static const String tagline = 'Belanja Murah, Kualitas Terjamin';

  // Auth
  static const String login = 'Masuk';
  static const String register = 'Daftar';
  static const String email = 'Email';
  static const String password = 'Kata Sandi';
  static const String fullName = 'Nama Lengkap';
  static const String phoneNumber = 'Nomor HP';

  // Navigation
  static const String home = 'Beranda';
  static const String catalog = 'Katalog';
  static const String cart = 'Keranjang';
  static const String orders = 'Pesanan';
  static const String profile = 'Akun';

  // Cart & Checkout
  static const String addToCart = 'Tambah ke Keranjang';
  static const String checkout = 'Checkout';
  static const String total = 'Total';
  static const String emptyCart = 'Keranjang masih kosong';
  static const String placeOrder = 'Buat Pesanan';

  // Generic
  static const String seeAll = 'Lihat Semua';
  static const String search = 'Cari produk...';
  static const String retry = 'Coba Lagi';
  static const String loading = 'Memuat...';
}
