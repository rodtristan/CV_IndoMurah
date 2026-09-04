/// Centralized string constants for the app.
///
/// TODO: Replace with a proper localization solution (e.g. `intl`/ARB files)
/// if multi-language support is needed later.
class AppStrings {
  AppStrings._();

  static const String appName = 'Toko CV IndoMurah - Absensi';

  // Auth
  static const String login = 'Masuk';
  static const String email = 'Email';
  static const String password = 'Kata Sandi';
  static const String loginButton = 'Masuk';
  static const String loginFailed = 'Login gagal. Periksa email dan kata sandi Anda.';

  // Home
  static const String home = 'Beranda';
  static const String todayStatus = 'Status Absensi Hari Ini';
  static const String checkIn = 'Absen Masuk';
  static const String checkOut = 'Absen Keluar';
  static const String notCheckedInYet = 'Belum Absen Masuk';
  static const String alreadyCheckedIn = 'Sudah Absen Masuk';
  static const String alreadyCheckedOut = 'Sudah Absen Keluar';

  // Check-in
  static const String checkInTitle = 'Absen Masuk';
  static const String checkOutTitle = 'Absen Keluar';
  static const String takeSelfie = 'Ambil Foto Selfie';
  static const String retakePhoto = 'Ambil Ulang Foto';
  static const String currentLocation = 'Lokasi Saat Ini';
  static const String fetchingLocation = 'Mengambil lokasi...';
  static const String submit = 'Kirim Absensi';

  // History
  static const String history = 'Riwayat Absensi';
  static const String noHistory = 'Belum ada riwayat absensi.';
}
