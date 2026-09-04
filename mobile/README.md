# Toko CV IndoMurah - Absensi (Mobile)

Aplikasi mobile absensi karyawan untuk bisnis **Toko CV IndoMurah**, dibangun dengan Flutter.

> **Status: Scaffold awal.** Struktur folder, UI, dan model data sudah siap dikembangkan,
> tetapi **belum terhubung ke backend API sungguhan**. Aksi login dan absen saat ini
> menggunakan data/logic dummy (placeholder) agar alur UI bisa dicoba end-to-end.

## Struktur Folder

```
lib/
├── main.dart                          # Entry point, setup MaterialApp + tema, route awal ke Login
├── core/
│   ├── constants/
│   │   ├── app_colors.dart            # Palet warna aplikasi
│   │   ├── app_strings.dart           # String/label UI (belum full i18n)
│   │   └── api_endpoints.dart         # Base URL & endpoint API backend (NestJS)
│   └── services/
│       ├── api_service.dart           # Wrapper HTTP client (package `http`) + Bearer token
│       ├── location_service.dart      # Wrapper `geolocator` untuk ambil GPS
│       └── auth_storage_service.dart  # Wrapper `flutter_secure_storage` untuk token JWT
├── models/
│   ├── user_model.dart                # Model data user/karyawan
│   └── attendance_model.dart          # Model data absensi (checkIn/checkOut, lokasi, status)
├── screens/
│   ├── auth/
│   │   └── login_screen.dart          # Form login (UI + placeholder logic)
│   ├── home/
│   │   └── home_screen.dart           # Status absen hari ini + tombol Absen Masuk/Keluar
│   └── attendance/
│       ├── check_in_screen.dart       # Ambil foto selfie + lokasi GPS sebelum submit absen
│       └── history_screen.dart        # Daftar riwayat absensi (dummy)
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

Base URL API diatur di `lib/core/constants/api_endpoints.dart`:

```dart
static const String baseUrl = 'http://localhost:5000/api/v1';
```

Sesuaikan nilai ini dengan environment tempat backend (folder `api`, NestJS, port 5000,
prefix `/api/v1`) berjalan:

- **Android emulator**: gunakan `http://10.0.2.2:5000/api/v1` (localhost host tidak
  bisa diakses langsung dari emulator).
- **iOS simulator**: `http://localhost:5000/api/v1` sudah bisa langsung dipakai.
- **Perangkat fisik**: gunakan IP LAN mesin development, mis. `http://192.168.x.x:5000/api/v1`.
- **Production**: ganti dengan URL API yang sudah di-deploy. Sebaiknya gunakan
  `--dart-define=API_BASE_URL=...` atau build flavors, bukan hardcode.

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
