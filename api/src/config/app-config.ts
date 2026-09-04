import { registerAs } from '@nestjs/config';

// ─── App Config ──────────────────────────────────────────────────────────────
// Semua konfigurasi dasar aplikasi dibaca dari environment variable (.env)
// Jika variable tidak ada, akan menggunakan nilai default di bawah ini.
// ─────────────────────────────────────────────────────────────────────────────
export default registerAs('app', () => {
  // CORS_ORIGIN bisa berisi satu atau beberapa URL dipisahkan koma
  // Contoh: http://localhost:4000,http://localhost:4001,http://localhost:4002
  const rawOrigin = process.env.CORS_ORIGIN || '';
  const corsOrigin: string | string[] = rawOrigin
    ? rawOrigin.split(',').map((o) => o.trim()).filter(Boolean)
    : '*'; // '*' = izinkan semua (gunakan hanya di development!)

  return {
    env: process.env.NODE_ENV || 'development',
    host: process.env.NODE_HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '5000', 10),
    corsOrigin,
  };
});
