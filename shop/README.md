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

Base URL API ada di `lib/core/constants/api_endpoints.dart` (default `http://localhost:5000/api/v1`, sesuaikan host untuk emulator Android: `10.0.2.2`, atau domain production).

## Status scaffold

Semua layar sudah jadi dengan **data dummy** dan alur UI lengkap (login → beranda → katalog → detail produk → keranjang → checkout → riwayat pesanan → profil/logout). State keranjang sudah berfungsi penuh secara lokal (belum sinkron ke server).

## Langkah lanjutan (butuh endpoint di `api/`)

1. Tambahkan model `Product`, `Category`, `Order`, `User` (dan endpoint auth login/register) di `prisma/schema.prisma` + modul NestJS terkait.
2. Ganti data dummy di `home_screen.dart`, `product_list_screen.dart`, `order_history_screen.dart` dengan pemanggilan `ApiService.instance.get(...)`.
3. Hubungkan `login_screen.dart` / `register_screen.dart` ke `ApiEndpoints.login` / `.register`, simpan token via `AuthStorageService`.
4. Sinkronkan `CartProvider` ke `ApiEndpoints.cart` (opsional — bisa tetap lokal untuk guest cart sebelum checkout).
5. Integrasikan payment gateway (mis. Midtrans/Xendit) di `checkout_screen.dart`.
6. Tambahkan wishlist, alamat tersimpan, dan notifikasi jika dibutuhkan (placeholder tombolnya sudah ada di `profile_screen.dart`).
