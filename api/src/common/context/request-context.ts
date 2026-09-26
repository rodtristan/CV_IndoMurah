// ================================================================
// request-context.ts — konteks per request (AsyncLocalStorage)
// ================================================================
//
// Dipakai untuk kolom audit Ketoko di daftar transaksi:
//   "User Ubah"  → UpdatedBy (username yang terakhir mengubah)
//   "Komputer"   → Device    (aplikasi klien, mis. "IndoMurah Web:1.0.0")
//
// Store dibuat di hook Fastify onRequest (main.ts), username diisi saat
// token JWT divalidasi (jwt-strategy.ts), lalu PrismaService (audit
// extension) menulisnya otomatis pada create/update model transaksi.
// ================================================================

import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContext {
  userId?: string;
  username?: string;
  device?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function currentContext(): RequestContext | undefined {
  return requestContext.getStore();
}

/** Label "Komputer": header X-Client dari aplikasi, atau jenis klien dari User-Agent. */
export function clientLabel(headers: Record<string, unknown>): string {
  const explicit = String(headers['x-client'] ?? '').trim();
  if (explicit) return explicit.replace(/[^\w .:/()-]/g, '').slice(0, 100);
  const ua = String(headers['user-agent'] ?? '');
  if (/dart|flutter/i.test(ua)) return 'Mobile App';
  if (/mozilla/i.test(ua)) return 'Web Browser';
  return ua ? ua.slice(0, 60) : 'API';
}

/** Model transaksi yang punya kolom UpdatedBy & Device. */
export const AUDITED_MODELS = new Set([
  'Sale', 'SaleReturn', 'PurchaseOrder', 'Purchase', 'PurchaseReturn', 'StockIn', 'StockOut', 'StockTransfer',
  'StockOpname', 'Journal', 'CashIn', 'CashOut', 'CashTransfer', 'CustomerDeposit', 'SupplierDeposit',
  'PointRedemption', 'StockMutation', 'CashFlowTransaction', 'QCCheck', 'SaleOrder', 'SalesCommissionPayment',
]);
