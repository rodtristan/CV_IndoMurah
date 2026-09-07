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
  static const String filterDay = 'Hari';
  static const String filterWeek = 'Minggu';
  static const String filterMonth = 'Bulan';
  static const String filterYear = 'Tahun';

  // Bottom navigation
  static const String payroll = 'Gaji';
  static const String profile = 'Profil';
  static const String settings = 'Pengaturan';

  // Payroll
  static const String payrollTitle = 'Slip Gaji';
  static const String baseSalary = 'Gaji Pokok';
  static const String allowance = 'Tunjangan';
  static const String deduction = 'Potongan';
  static const String netSalary = 'Total Diterima';
  static const String payrollPaid = 'Sudah Dibayar';
  static const String payrollPending = 'Belum Dibayar';

  // Settings
  static const String notifications = 'Notifikasi';
  static const String darkMode = 'Mode Gelap';
  static const String appVersion = 'Versi Aplikasi';
  static const String logout = 'Keluar';
  static const String logoutConfirmTitle = 'Keluar dari akun?';
  static const String logoutConfirmMessage = 'Kamu harus login kembali untuk mengakses aplikasi ini.';
  static const String cancel = 'Batal';

  // Generic errors
  static const String connectionError = 'Tidak bisa terhubung ke server. Periksa koneksi internet Anda.';
}
