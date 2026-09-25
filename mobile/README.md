# Absensi CV IndoMurah (Mobile)

Aplikasi Flutter untuk absensi karyawan CV IndoMurah: **Clock In / Clock Out dengan selfie
(kamera depan) + GPS + geofence kantor**, dan **absensi offline** yang disinkronkan otomatis
saat internet kembali. Terhubung ke backend `api/` (NestJS) lewat endpoint
`/api/v1/attendance-mobile/*`.

Akun karyawan (username + password) dan lokasi kantor dibuat oleh HRD di aplikasi web.

## Fitur

- **Login** username + password. Token disimpan di `flutter_secure_storage`; saat aplikasi dibuka
  dilakukan auto-login via `GET /me`. Respon 401 di mana pun -> kembali ke layar login.
- Respon `/me` terakhir (karyawan, lokasi kantor, aturan, absensi hari ini) **di-cache di HP**,
  sehingga beranda dan pengecekan geofence tetap jalan saat offline.
- **Beranda**: nama, tanggal & jam WIB, kantor + jarak live ("Di dalam area kantor" /
  "Di luar area (X m)"), jam masuk/pulang hari ini + status (Hadir/Terlambat) + badge offline,
  tombol besar Clock In / Clock Out, jumlah antrean offline + tombol "Sinkronkan sekarang",
  daftar absensi offline yang ditolak server, tarik-untuk-refresh.
- **Clock In/Out**: GPS akurasi tinggi -> diblokir jika GPS mati / izin ditolak / Fake GPS
  (`isMocked`) / akurasi > `maxGpsAccuracyMeters` / di luar radius kantor (haversine terhadap
  lokasi kantor yang di-cache). Lalu selfie **kamera depan saja** (tidak ada pilihan galeri),
  kemudian **timestamp foto** dicetak ke dalam gambar (tanggal & jam WIB, lat/lng, akurasi,
  kantor, nama, label OFFLINE) — resize maks 1000 px, JPEG q80 (~100-200 KB). Preview, lalu kirim.
- **Offline**: tanpa internet (atau saat koneksi gagal/timeout/5xx) absensi disimpan di antrean
  lokal (foto di `<app documents>/offline_photos/`, antrean di `offline_queue.json`) dengan
  `capturedAt` = jam HP saat foto diambil. Beranda langsung menampilkan jam absen dengan badge
  "Menunggu sinkron". Antrean dikirim FIFO (masuk sebelum pulang) dengan `offline=true` saat
  koneksi kembali (listener `connectivity_plus`), saat aplikasi dibuka kembali, dan lewat tombol
  manual. 2xx/409 -> dihapus; 400 -> dihapus dan pesan server ditampilkan di daftar "ditolak";
  error jaringan -> tetap di antrean. Data offline > 72 jam ditolak server (diperingatkan di UI).
- **Riwayat**: pilih bulan, daftar dari `GET /history?month=YYYY-MM`.
- **Profil**: kode & nama karyawan, kantor, versi aplikasi, keluar (peringatan jika masih ada
  data offline yang belum terkirim — data tersebut akan hilang saat logout).

## Struktur

```
lib/
├── main.dart                     # Root app, gate login/beranda berdasarkan AppController
├── core/constants/api_endpoints.dart  # API_BASE_URL (--dart-define) + endpoint
├── core/constants/app_colors.dart
├── core/utils/wib.dart           # Format waktu WIB (UTC+7) + haversine
├── models/absensi_models.dart    # Employee, OfficeLocation, Attendance, MeData, OfflineItem, ...
├── services/
│   ├── api_client.dart           # HTTP client (ApiException / NetworkException / 401)
│   ├── app_controller.dart       # ChangeNotifier: auth, cache /me, submit, antrean & sinkron
│   ├── local_store.dart          # Token (secure storage), cache & antrean (file JSON)
│   ├── location_service.dart     # Izin + posisi GPS + cek geofence
│   └── photo_service.dart        # Kamera depan + watermark (package `image`, di isolate)
└── ui/                           # login, shell (bottom nav), home, clock, history, profile
```

> Catatan: file scaffold lama (`lib/screens/`, `lib/widgets/`, `lib/core/services/`,
> `lib/core/constants/app_strings.dart`, `lib/models/*_model.dart`, termasuk layar/model
> Payroll) tidak lagi dipakai oleh aplikasi dan aman dihapus.

## Menjalankan

Prasyarat: Flutter 3.38+ (Dart 3.10), Android SDK, JDK 17.

```bash
cd mobile
flutter pub get
```

Base URL API diatur saat build dengan `--dart-define=API_BASE_URL=...`
(default: `http://10.0.2.2:5000/api/v1`, yaitu API lokal dari emulator Android).

| Target | Perintah |
| --- | --- |
| Emulator Android, API lokal | `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1` |
| HP fisik, API lokal (satu WiFi) | `flutter run --dart-define=API_BASE_URL=http://192.168.1.10:5000/api/v1` (ganti dengan IP LAN PC: `ipconfig`) |
| Produksi | `flutter run --dart-define=API_BASE_URL=https://cvindomurah.up.railway.app/api/v1` |

Untuk HP fisik: pastikan API listen di `0.0.0.0` (bukan hanya localhost) dan port 5000 diizinkan
Windows Firewall. HTTP (non-https) diizinkan lewat `android:usesCleartextTraffic="true"` untuk
kebutuhan development.

Uji mode offline: matikan WiFi & data seluler, lakukan Clock In, lalu nyalakan lagi — antrean
terkirim otomatis dan badge "Menunggu sinkron" hilang.

## Build APK

```bash
# Debug
flutter build apk --debug --dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1

# Release (produksi)
flutter build apk --release --dart-define=API_BASE_URL=https://cvindomurah.up.railway.app/api/v1
```

Hasil: `build/app/outputs/flutter-apk/app-release.apk` (atau `app-debug.apk`).
Release saat ini masih ditandatangani dengan debug key (lihat `android/app/build.gradle.kts`);
buat keystore sendiri sebelum distribusi resmi / Play Store.

## Tes & analisis

```bash
flutter analyze
flutter test
```

## Catatan platform

- Android: minSdk 23+, AGP 8.9.1, Kotlin 2.1.0, Gradle 8.11.1. Izin: INTERNET,
  ACCESS_NETWORK_STATE, CAMERA, ACCESS_FINE_LOCATION, ACCESS_COARSE_LOCATION.
- iOS: `NSCameraUsageDescription` dan `NSLocationWhenInUseUsageDescription` sudah diisi
  (Bahasa Indonesia). Belum diuji di iOS.
- `preferredCameraDevice: front` adalah permintaan ke aplikasi kamera; sebagian HP Android
  mengabaikannya dan membuka kamera belakang. Galeri tidak pernah ditawarkan.
