# Toko CV IndoMurah — Shop (Ecommerce Mobile App)

Aplikasi mobile untuk pelanggan berbelanja online, terpisah dari [`mobile/`](../mobile) (yang khusus absensi karyawan). Backend memakai NestJS di folder [`api/`](../api).

## Struktur

```
lib/
├── main.dart                     # entry point, MultiProvider, splash gate (cek token)
├── core/
│   ├── constants/                # app_colors, app_strings, api_endpoints
│   └── services/                 # api_service (http wrapper), auth_storage_service (JWT)
├── models/                       # product, category, cart_item, order, user
├── providers/
│   └── cart_provider.dart        # state keranjang (ChangeNotifier + provider)
├── screens/
│   ├── auth/                     # login, register
│   ├── home/                     # main_navigation_screen (bottom nav) + home_screen
│   ├── catalog/                  # product_list_screen, product_detail_screen
│   ├── cart/                     # cart_screen
│   ├── checkout/                 # checkout_screen
│   ├── orders/                   # order_history_screen, order_detail_screen
│   └── profile/                  # profile_screen (logout)
└── widgets/                      # product_card, category_chip, custom_button
```

## Menjalankan

```bash
flutter pub get
flutter run
```

Base URL API ada di `lib/core/constants/api_endpoints.dart`, lewat
`String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:5000/api/v1')`
— override saat build tanpa ubah kode:

- Emulator Android: `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000/api/v1`
- Build release (production, Railway): `flutter build apk --release --dart-define=API_BASE_URL=https://cvindomurah.up.railway.app/api/v1`
  (persis yang dijalankan otomatis oleh service `shop-apk-builder` di root `docker-compose.yml`)

## Status scaffold

Login/register **sudah** terhubung ke backend sungguhan (`POST /auth/login`, `POST /auth/register`) dan menjadi gate wajib masuk app (`_SplashGate` di `main.dart`) — tidak ada jalur tanpa login. Katalog/keranjang/checkout/riwayat pesanan masih **data dummy**. State keranjang sudah berfungsi penuh secara lokal (belum sinkron ke server).

## Langkah lanjutan (butuh endpoint di `api/`)

1. Tambahkan model `Product`, `Category`, `Order` di `prisma/schema.prisma` + modul NestJS terkait.
2. Ganti data dummy di `home_screen.dart`, `product_list_screen.dart`, `order_history_screen.dart` dengan pemanggilan `ApiService.instance.get(...)`.
3. Sinkronkan `CartProvider` ke `ApiEndpoints.cart` (opsional — bisa tetap lokal untuk guest cart sebelum checkout).
4. Integrasikan payment gateway (mis. Midtrans/Xendit) di `checkout_screen.dart`.
5. Tambahkan wishlist, alamat tersimpan, dan notifikasi jika dibutuhkan (placeholder tombolnya sudah ada di `profile_screen.dart`).
