// ================================================================
// redact.ts — Sembunyikan nilai sensitif sebelum di-log / disimpan
// ================================================================
//
// Rekursif (objek & array bersarang) dan case-insensitive.
// Nama key dinormalisasi (lowercase, tanpa '_' / '-') lalu dicocokkan
// dengan daftar di bawah, jadi `Password`, `new_password`, `NewPassword`,
// `refresh_token`, `accessToken`, `Authorization` semuanya tertangkap.
// ================================================================

const EXACT_KEYS = new Set([
  'password',
  'passwordhash',
  'newpassword',
  'currentpassword',
  'oldpassword',
  'passwordconfirmation',
  'confirmpassword',
  'token',
  'accesstoken',
  'refreshtoken',
  'authorization',
  'secret',
  'clientsecret',
  'apikey',
  'pin',
  'otp',
]);

/** Key yang mengandung salah satu kata ini juga dianggap sensitif. */
const SUBSTRINGS = ['password', 'token', 'secret', 'apikey'];

export function isSensitiveKey(key: string): boolean {
  const k = String(key).toLowerCase().replace(/[_\-\s]/g, '');
  if (EXACT_KEYS.has(k)) return true;
  return SUBSTRINGS.some((s) => k.includes(s));
}

const MAX_DEPTH = 8;

export function redactDeep<T = unknown>(value: T, depth = 0): T {
  if (value === null || value === undefined) return value;
  if (typeof value !== 'object') return value;
  if (depth > MAX_DEPTH) return '[TRUNCATED]' as unknown as T;
  if (value instanceof Date) return value;
  if (Array.isArray(value)) {
    return value.map((v) => redactDeep(v, depth + 1)) as unknown as T;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = isSensitiveKey(k) ? '[REDACTED]' : redactDeep(v, depth + 1);
  }
  return out as T;
}
