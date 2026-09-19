import { FieldType, ReportFieldDef, ReportParamDef } from './report-engine.types';

export const f = (key: string, label: string, type: FieldType = 'string'): ReportFieldDef => ({ key, label, type });

export const n = (v: unknown): number => (v === null || v === undefined ? 0 : Number(v));

const TZ = 'Asia/Jakarta';
const ymdFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });

/** Date -> 'YYYY-MM-DD' in the business timezone ('' when empty) */
export const ymd = (d: Date | null | undefined): string => (d ? ymdFmt.format(d) : '');

export const todayStr = (): string => ymdFmt.format(new Date());
export const monthStartStr = (): string => todayStr().slice(0, 8) + '01';

/** Trimmed string param; undefined when missing/empty ("no filter"). */
export function str(p: Record<string, any>, key: string): string | undefined {
  const v = p?.[key];
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s === '' ? undefined : s;
}

export function int(p: Record<string, any>, key: string): number | undefined {
  const s = str(p, key);
  if (s === undefined) return undefined;
  const v = Number(s);
  return Number.isFinite(v) ? v : undefined;
}

export function bool(p: Record<string, any>, key: string): boolean {
  const v = p?.[key];
  return v === true || v === 'true' || v === '1' || v === 1;
}

export function startOf(s?: string): Date | undefined {
  if (!s) return undefined;
  const d = new Date(`${s.slice(0, 10)}T00:00:00+07:00`);
  return isNaN(d.getTime()) ? undefined : d;
}
export function endOf(s?: string): Date | undefined {
  if (!s) return undefined;
  const d = new Date(`${s.slice(0, 10)}T23:59:59.999+07:00`);
  return isNaN(d.getTime()) ? undefined : d;
}

/** Prisma DateTime filter from two date params, or undefined when both empty */
export function dateFilter(p: Record<string, any>, fromKey = 'tanggalDari', toKey = 'tanggalSampai') {
  const gte = startOf(str(p, fromKey));
  const lte = endOf(str(p, toKey));
  if (!gte && !lte) return undefined;
  return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
}

/** Prisma string range filter over a Code column */
export function codeRange(p: Record<string, any>, fromKey: string, toKey: string) {
  const gte = str(p, fromKey);
  const lte = str(p, toKey);
  if (!gte && !lte) return undefined;
  return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
}

// ─── param builders ─────────────────────────────────────────
export const dateRangeParams = (): ReportParamDef[] => [
  { key: 'tanggalDari', label: 'Tanggal Dari', type: 'date', defaultValue: monthStartStr() },
  { key: 'tanggalSampai', label: 'Tanggal Sampai', type: 'date', defaultValue: todayStr() },
];

export const lookupParam = (key: string, label: string, endpoint: string): ReportParamDef => ({
  key,
  label,
  type: 'lookup',
  source: { endpoint, valueField: 'Code', labelField: 'Name', codeField: 'Code' },
});

export const warehouseParam = (): ReportParamDef => ({
  key: 'gudang',
  label: 'Gudang',
  type: 'select',
  source: { endpoint: 'warehouse', valueField: 'ID', labelField: 'Name' },
});

export const paymentStatusParam = (): ReportParamDef => ({
  key: 'status',
  label: 'Status',
  type: 'select',
  defaultValue: '',
  options: [
    { value: '', label: 'Semua' },
    { value: 'PENDING', label: 'Menunggu' },
    { value: 'PARTIAL', label: 'Sebagian' },
    { value: 'PAID', label: 'Lunas' },
    { value: 'OVERDUE', label: 'Jatuh Tempo' },
  ],
});

export const daysBetween = (from: Date, to: Date): number => Math.floor((to.getTime() - from.getTime()) / 86400000);
