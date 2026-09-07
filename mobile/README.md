# Toko CV IndoMurah - Absensi (Mobile)

Aplikasi mobile absensi karyawan untuk bisnis **Toko CV IndoMurah**, dibangun dengan Flutter.

> **Status.** Login sudah terhubung ke backend sungguhan (`POST /api/v1/auth/login`) dan
> menjadi satu-satunya pintu masuk ke aplikasi — tanpa token valid, tidak bisa masuk
> (lihat `_SplashGate` di `main.dart`). Absensi (check-in/out) dan slip gaji (Payroll)
> masih memakai data/logic dummy karena modulnya belum ada di backend — lihat komentar
> `TODO` di `check_in_screen.dart`, `history_screen.dart`, dan `payroll_model.dart`.

## Struktur Folder

```
lib/
├── main.dart                          # Entry point + `_SplashGate` (cek token -> MainShell/Login)
├── core/
│   ├── constants/
│   │   ├── app_colors.dart            # Palet warna aplikasi
│   │   ├── app_strings.dart           # String/label UI (belum full i18n)
│   │   └── api_endpoints.dart         # Base URL & endpoint API backend (NestJS)
│   └── services/
│       ├── api_service.dart           # Wrapper HTTP client (package `http`) + Bearer token
│       ├── location_service.dart      # Wrapper `geolocator` untuk ambil GPS
│       └── auth_storage_service.dart  # Wrapper `flutter_secure_storage` untuk token JWT + user
├── models/
│   ├── user_model.dart                # Model data user/karyawan (field cocok dengan API)
│   ├── attendance_model.dart          # Model data absensi (checkIn/checkOut, lokasi, status)
│   └── payroll_model.dart             # Model slip gaji (dummy, belum ada endpoint backend)
├── screens/
│   ├── auth/
│   │   └── login_screen.dart          # Form login, terhubung ke POST /auth/login
│   ├── home/
│   │   ├── main_shell.dart            # Bottom nav: Beranda/Gaji/Profil/Pengaturan
│   │   └── home_screen.dart           # Status absen hari ini + tombol Absen Masuk/Keluar
│   ├── attendance/
│   │   ├── check_in_screen.dart       # Ambil foto selfie + lokasi GPS sebelum submit absen
│   │   └── history_screen.dart        # Riwayat absensi + filter hari/minggu/bulan/tahun (dummy)
│   ├── payroll/
│   │   └── payroll_screen.dart        # Daftar & detail slip gaji per bulan (dummy)
│   ├── profile/
│   │   └── profile_screen.dart        # Info user yang login (dari data login tersimpan)
│   └── settings/
│       └── settings_screen.dart       # Toggle notifikasi/dark mode (dummy) + Logout
└── widgets/
    ├── custom_button.dart             # Tombol reusable dengan state loading
    └── attendance_card.dart           # Kartu untuk menampilkan satu record absensi
```

## Cara Menjalankan

```bash
flutter pub get
flutter run
```

Jalankan `flutter analyze` untuk memastikan tidak ada error kompilasi, dan
`flutter test` untuk menjalankan smoke test dasar.

## Konfigurasi Backend

Base URL API diatur di `lib/core/constants/api_endpoints.dart` lewat
`String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:5000/api/v1')`
— defaultnya localhost untuk `flutter run` sehari-hari, di-override saat build
lewat `--dart-define`, **tanpa perlu ubah kode**:

- **Android emulator**: `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1`
  (localhost host tidak bisa diakses langsung dari emulator).
- **iOS simulator**: default (`localhost`) sudah bisa langsung dipakai.
- **Perangkat fisik**: pakai IP LAN mesin development,
  `flutter run --dart-define=API_BASE_URL=http://192.168.x.x:5000/api/v1`.
- **Build release (production, Railway)**:
  `flutter build apk --release --dart-define=API_BASE_URL=https://cvindomurah.up.railway.app/api/v1`
  — ini persis yang dijalankan otomatis oleh service `mobile-apk-builder` di
  root `docker-compose.yml` (lihat `API_BASE_URL_RELEASE` di root `.env.example`).

## Dependency Utama

| Package                  | Kegunaan                                             |
|---------------------------|-------------------------------------------------------|
| `http`                    | HTTP client untuk komunikasi ke REST API backend       |
| `geolocator`               | Ambil koordinat GPS saat absen                        |
| `image_picker`              | Ambil foto selfie via kamera saat absen               |
| `flutter_secure_storage`     | Simpan token JWT secara aman di device                |
| `intl`                     | Format tanggal & jam (locale `id_ID`)                  |
| `permission_handler`         | Cek/minta izin runtime (lokasi, kamera)                |

## Perizinan (Permissions)

- **Android** (`android/app/src/main/AndroidManifest.xml`): `INTERNET`,
  `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `CAMERA`.
- **iOS** (`ios/Runner/Info.plist`): `NSCameraUsageDescription`,
  `NSLocationWhenInUseUsageDescription`, `NSPhotoLibraryUsageDescription`.

## Langkah Lanjutan (Belum Dikerjakan)

- Integrasi nyata ke API backend NestJS (login, ambil status absen hari ini,
  submit absen masuk/keluar dengan upload foto multipart, riwayat absensi dengan paginasi).
- State management yang lebih terstruktur (mis. Provider/Riverpod/Bloc) — saat ini
  masih pakai `StatefulWidget` sederhana untuk kemudahan scaffold.
- Refresh token / auto-logout saat token kedaluwarsa (401 handling di `ApiService`).
- Validasi & error handling yang lebih lengkap (mis. retry saat gagal ambil lokasi/submit).
- Splash screen / auto-login jika token tersimpan masih valid (cek via `AuthStorageService`).
- Unit test & widget test tambahan untuk masing-masing screen/service.
