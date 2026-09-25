// ================================================================
// admin-route-guard.ts — Otorisasi global untuk route sensitif (APP_GUARD)
// ================================================================
//
// Semua modul sudah memakai JwtAuthGuard ("harus login"), tapi itu belum
// membedakan kasir dan administrator. Guard global ini menutup route yang
// berbahaya bila dipakai non-admin:
//
//   ADMIN_ALL   → semua method hanya untuk Administrator
//   ADMIN_WRITE → GET/HEAD boleh untuk user login, POST/PUT/PATCH/DELETE admin
//
// FAIL CLOSED: bila route cocok dengan aturan dan status user tidak bisa
// dipastikan (DB error, user hilang, token aneh) → ditolak.
//
// Karena APP_GUARD berjalan SEBELUM guard di level controller, guard ini
// menjalankan autentikasi JWT sendiri (JwtAuthGuard) untuk route yang dijaga.
// Status admin/aktif diambil dari AuthzService (cache Redis 30 detik).
//
// Pencocokan memakai pola route yang dicocokkan Fastify (req.routeOptions.url),
// di-lowercase, jadi variasi huruf besar/kecil atau encoding URL tidak bisa
// dipakai untuk mengelak.
// ================================================================

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { AuthzService } from '../auth/authz-service';
import { JwtAuthGuard } from './jwt-auth-guard';

const API_PREFIX = '/api/v1/';

/** Semua method → Administrator saja. */
const ADMIN_ALL: string[] = [
  'auth/register',
  'users',
  'roles',
  'user-role',
  'role-menu',
  'user-menu',
  'menus',
  'backup',
  'log',
  'activity-log',
  'accounting', // balance-repair (cek & perbaiki saldo akun)
  'business-logic/accounting', // termasuk year-close & fiscal-years
  'business-logic/journal',
  'journal',
  'journal-entry',
  'opening-balance',
  'fiscal-year',
  'import',
  'product-import',
  'stock-balance',
  'attendance-admin',
  'testing',
];

/** Baca boleh untuk semua user login; tulis → Administrator. */
const ADMIN_WRITE: string[] = [
  'company',
  'app-setting',
  'general-settings',
  'numbering',
  'account-setting',
  'notification-setting',
];

/** Pengecualian di dalam prefix ADMIN_ALL yang dibutuhkan semua user login. */
const OPEN_EXCEPTIONS: { method: string; path: RegExp }[] = [
  { method: 'GET', path: /^menus\/my-menus$/ },
  { method: 'GET', path: /^menus\/check\/[^/]+$/ },
];

function matchesPrefix(path: string, prefixes: string[]): boolean {
  return prefixes.some((p) => path === p || path.startsWith(p + '/'));
}

export type RouteRule = 'admin' | 'none';

/** Diekspor supaya bisa diuji / dipakai ulang. `path` tanpa prefix /api/v1/, lowercase. */
export function resolveRouteRule(method: string, path: string): RouteRule {
  const m = method.toUpperCase();
  if (OPEN_EXCEPTIONS.some((e) => e.method === m && e.path.test(path))) return 'none';
  if (matchesPrefix(path, ADMIN_ALL)) return 'admin';
  if (matchesPrefix(path, ADMIN_WRITE) && m !== 'GET' && m !== 'HEAD') return 'admin';
  return 'none';
}

function normalizePath(raw: string): string {
  let p = String(raw || '').split('?')[0];
  try {
    p = decodeURIComponent(p);
  } catch {
    /* biarkan apa adanya */
  }
  p = p.toLowerCase().replace(/\/{2,}/g, '/');
  if (p.startsWith(API_PREFIX)) p = p.slice(API_PREFIX.length);
  else if (p.startsWith('/')) p = p.slice(1);
  return p.replace(/\/+$/, '');
}

@Injectable()
export class AdminRouteGuard implements CanActivate {
  private readonly logger = new Logger('AdminRouteGuard');
  private readonly jwtGuard = new JwtAuthGuard();

  constructor(private readonly authz: AuthzService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (context.getType() !== 'http') return true;
    const req = context.switchToHttp().getRequest();

    // Pola route Fastify (mis. /api/v1/users/:id); fallback ke URL mentah.
    const routePattern: string | undefined = req.routeOptions?.url ?? req.routerPath;
    const path = normalizePath(routePattern ?? req.url ?? '');
    const rawPath = normalizePath(req.url ?? '');
    const method = String(req.method ?? 'GET');

    // Evaluasi keduanya: pola route & URL mentah — yang lebih ketat menang.
    const rule =
      resolveRouteRule(method, path) === 'admin' || resolveRouteRule(method, rawPath) === 'admin' ? 'admin' : 'none';
    if (rule === 'none') return true;

    // 1) Autentikasi (401 bila token tidak ada / tidak valid / user nonaktif).
    await this.jwtGuard.canActivate(context);

    // 2) Otorisasi — fail closed.
    const user = req.user as { id?: string } | undefined;
    try {
      if (!user?.id) throw new ForbiddenException('Akses ditolak');
      const access = await this.authz.getAccess(user.id);
      if (!access.exists || !access.isActive || !access.isAdmin) {
        throw new ForbiddenException('Akses ditolak: hanya Administrator yang boleh mengakses fitur ini');
      }
      return true;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      this.logger.error(`Gagal memeriksa hak akses (${method} ${path}): ${(err as Error)?.message}`);
      throw new ForbiddenException('Akses ditolak');
    }
  }
}
