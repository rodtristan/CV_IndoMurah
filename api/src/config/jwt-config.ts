import { registerAs } from '@nestjs/config';

const DEV_FALLBACK_SECRET = 'dev-only-insecure-jwt-secret-change-me-0123456789';
const MIN_SECRET_LENGTH = 32;

/**
 * Satu-satunya sumber JWT secret untuk back office.
 * - production: JWT_SECRET WAJIB ada dan >= 32 karakter, kalau tidak → throw
 *   (dipanggil di main.ts sebelum app dibuat, jadi server gagal start).
 * - selain production: pakai JWT_SECRET bila ada, kalau tidak fallback dev
 *   (dengan peringatan) supaya development tetap jalan.
 */
export function resolveJwtSecret(env: NodeJS.ProcessEnv = process.env): string {
  const secret = (env.JWT_SECRET ?? '').trim();
  if (env.NODE_ENV === 'production') {
    if (secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET wajib diisi (minimal ${MIN_SECRET_LENGTH} karakter) saat NODE_ENV=production. ` +
          'Buat dengan: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"',
      );
    }
    return secret;
  }
  return secret || DEV_FALLBACK_SECRET;
}

export default registerAs('jwt', () => ({
  secret: resolveJwtSecret(),
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  authSecretKey: process.env.AUTH_SECRET_KEY || '',
}));
