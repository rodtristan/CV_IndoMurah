# Toko CV IndoMurah - Admin Dashboard

Admin dashboard untuk **Toko CV IndoMurah**, hasil **porting desain** dari [Nuxt Dashboard Template](https://dashboard-template.nuxt.dev/) (Vue 3 + Nuxt UI Pro, ada di folder sibling `../website`) ke **Next.js 16 (App Router) + React 19 + Tailwind CSS v4**.

Tujuan porting ini adalah kemiripan visual, layout, dan copy/teks semirip mungkin dengan template Nuxt aslinya, dibangun ulang dengan primitives React (tanpa dependensi ke Vue/Nuxt UI). Project ini **menggantikan total** landing page marketing yang sebelumnya ada di folder `website2` — bukan ditambahkan sebagai halaman terpisah.

## Halaman yang Tersedia

- **Home** (`/`) — kartu statistik (Customers/Conversions/Revenue/Orders), area chart pendapatan (Recharts), tabel penjualan terbaru, date-range picker, dan period selector (daily/weekly/monthly).
- **Inbox** (`/inbox`) — daftar email dua-panel (list + panel baca), tab All/Unread, panel balas email, slide-over untuk tampilan mobile.
- **Customers** (`/customers`) — tabel pelanggan dengan seleksi baris, sorting kolom email, filter email & status, toggle visibilitas kolom, pagination, modal tambah/hapus pelanggan.
- **Settings** (`/settings`) — form profil umum, plus sub-halaman:
  - `/settings/members` — daftar anggota tim + pencarian.
  - `/settings/notifications` — preferensi notifikasi (switch toggles).
  - `/settings/security` — ganti password & hapus akun.
- Sidebar (collapsible, ada menu tim & pencarian), header dengan notifikasi (slide-over) dan user menu (termasuk light/dark/system theme toggle), serta modal pencarian cepat (⌘K).

## Menjalankan Secara Lokal

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

Build production:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

## Catatan Penting: Data Masih Dummy

**Semua data di dashboard ini adalah data statis/dummy**, di-port apa adanya dari mock data asli template Nuxt (`website/server/api/*.ts`) ke `src/lib/mock-data.ts`. Belum ada koneksi ke backend NestJS di folder `api/`. Sebelum dashboard ini dipakai secara nyata:

- Ganti `src/lib/mock-data.ts` (customers, mails, members, notifications) dengan fetch ke endpoint asli di `api/`.
- Statistik di Home (`HomeStats`, `HomeChart`, `HomeSales`) masih menghasilkan angka acak (`randomInt`) di client — sambungkan ke data penjualan/analitik asli.
- Form Settings (General, Notifications, Security) hanya menampilkan toast sukses tanpa benar-benar menyimpan apa pun — sambungkan ke API.
- Autentikasi/otorisasi belum ada — dashboard ini masih 100% publik secara struktur route.

## Struktur Penting

- `src/app/layout.tsx` — Root layout: font `Public Sans` (`next/font/google`), `ThemeProvider` (next-themes, light/dark/system), `ToastProvider`, `DashboardProvider` (state sidebar/notifikasi/shortcut keyboard), dan `DashboardShell` (sidebar + area konten) yang membungkus seluruh halaman.
- `src/app/page.tsx`, `src/app/inbox/page.tsx`, `src/app/customers/page.tsx`, `src/app/settings/**` — route per halaman dashboard.
- `src/components/layout/` — `Sidebar`, `TeamsMenu`, `UserMenu`, `NotificationsSlideover`, `SearchModal`, `PageHeader` (Navbar/Toolbar).
- `src/components/home/`, `src/components/inbox/`, `src/components/customers/`, `src/components/settings/` — komponen per fitur.
- `src/components/ui/` — primitives UI custom (Button, Badge, Avatar, Input, Select, Modal, Slideover, Dropdown, dll) yang meniru tampilan Nuxt UI Pro dengan Tailwind + Headless UI.
- `src/lib/mock-data.ts` — data dummy (customers, mails, members, notifications), di-port persis dari `website/server/api/*.ts`.
- `src/lib/dashboard-context.tsx` — state global dashboard (sidebar collapse/mobile, notifications slide-over, search modal, keyboard shortcuts `g h`/`g i`/`g c`/`g s`/`n`/`⌘K`).
- `src/lib/toast-context.tsx` — sistem toast notifikasi ringan (pengganti `useToast()` Nuxt UI).
- `src/app/globals.css` — tema warna Tailwind v4 (`@theme`), termasuk skala warna hijau brand (`#00DC82` dst, di-port dari `website/app/assets/css/main.css`) dan token semantik (`bg-elevated`, `text-muted`, `border-default`, dll) untuk light/dark mode.
- `src/app/robots.ts` — dashboard internal, di-set `disallow: "/"` agar tidak diindeks mesin pencari.

## Dependency Tambahan

Ditambahkan khusus untuk porting dashboard ini:

- `lucide-react` — ikon (padanan `@iconify-json/lucide`).
- `recharts` — chart area pendapatan di halaman Home.
- `@headlessui/react` — Dialog (modal/slide-over/search), Menu (dropdown), Switch — aksesibel & mudah di-style dengan Tailwind.
- `next-themes` — dark mode (light/dark/system).
- `date-fns` — manipulasi tanggal (range, format, relative time), dipakai konsisten dengan template asli.
- `clsx` + `tailwind-merge` — util `cn()` untuk menggabungkan className secara aman.

## Batasan Porting (Tidak 100% Identik)

- **Date range picker** (Home) disederhanakan menjadi dropdown daftar preset ("Last 7 days", dst) tanpa grid kalender dua-bulan interaktif seperti versi Nuxt (yang memakai `UCalendar`) — cukup kompleks untuk dibangun ulang dari nol dan bukan bagian inti dari fungsi dashboard.
- **Command palette / search** (⌘K) disederhanakan menjadi modal pencarian navigasi sederhana, bukan implementasi `cmdk`-style penuh dengan grup hasil dinamis dari seluruh konten.
- **Sidebar resizable** (drag untuk mengubah lebar) tidak diimplementasikan — hanya collapse/expand (ikon saja vs ikon+label), sesuai kebutuhan utama.
- **Color/neutral palette switcher** di User Menu (mengganti warna primary/neutral secara live) tidak di-port — palet warna mengikuti `app.config.ts` asli (primary hijau, neutral zinc) secara statis. Toggle tema light/dark/system tetap berfungsi penuh.
- Tabel (Customers) memakai state React biasa untuk sorting/filter/pagination/visibilitas kolom (bukan `@tanstack/table`), cukup untuk ukuran data dummy saat ini namun kurang scalable dibanding versi asli jika data bertambah besar.
