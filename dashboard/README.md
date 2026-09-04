# Toko CV IndoMurah — Dashboard

Admin dashboard untuk Toko CV IndoMurah, di-scaffold dari template resmi Nuxt UI Pro.

## Sumber Template

- Template: **Nuxt Dashboard Template** — https://dashboard-template.nuxt.dev/
- Repo sumber: [`nuxt-ui-pro/dashboard`](https://github.com/nuxt-ui-pro/dashboard) (bagian dari ekosistem Nuxt UI, gratis/open source sejak Nuxt UI v3)
- Di-clone tanpa history git menggunakan `giget` (`npx giget@latest gh:nuxt-ui-pro/dashboard dashboard --force`)

## Cara Menjalankan

```bash
npm install
npm run dev
```

Buka `http://localhost:3000`.

Untuk build production:

```bash
npm run build
npm run preview   # opsional, preview hasil build
```

> Catatan install: pada mesin ini `npm install` biasa sempat gagal karena bug internal npm 11.4.2
> (`Cannot read properties of null (reading 'edgesOut')` di Arborist saat resolve peer deps).
> Jika mengalami hal yang sama, gunakan `npm install --legacy-peer-deps`.

## Environment Variables

Salin `.env.example` ke `.env` bila perlu (dipakai untuk OG image saat `nuxt generate`):

```
NUXT_PUBLIC_SITE_URL=
```

## Branding yang Sudah Disesuaikan

Struktur, komponen, dan halaman bawaan template (sidebar, data table pelanggan, inbox, chart statistik home, settings, dsb) **tidak diubah** — hanya teks/placeholder branding berikut yang diganti dari demo template menjadi identitas Toko CV IndoMurah:

- `app/app.vue` — `<title>` dan meta description menjadi "Toko CV IndoMurah — Dashboard".
- `app/components/TeamsMenu.vue` — dropdown tim di pojok kiri atas sidebar, dari daftar demo (Nuxt / NuxtHub / NuxtLabs) menjadi satu entri "Toko CV IndoMurah" dengan ikon toko.
- `package.json` — field `name` menjadi `toko-cv-indomurah-dashboard`.

## Yang Masih Perlu Disesuaikan

- **Data dummy**: halaman Home (stats/chart), Inbox, dan Customers masih memakai data contoh dari `server/api/*` (mock). Perlu diganti agar mengambil data asli.
- **Koneksi ke API backend**: folder `api/` di root project (`../api`) belum dihubungkan. Perlu menambahkan base URL API (mis. via `runtimeConfig` di `nuxt.config.ts` atau `.env`) dan mengganti endpoint mock di `server/api/*` / composable fetch dengan panggilan ke API sebenarnya.
- **Autentikasi**: belum ada logic login/session nyata — menu user (`UserMenu.vue`) masih memakai user contoh ("Benjamin Canac").
- **Logo**: avatar toko di `TeamsMenu.vue` masih pakai ikon generic (`i-lucide-store`), belum logo asli Toko CV IndoMurah — bisa diganti dengan file logo di `public/`.
- **Favicon**: `public/favicon.ico` masih bawaan template.
