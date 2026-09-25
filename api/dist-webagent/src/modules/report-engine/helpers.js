"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.daysBetween = exports.paymentStatusParam = exports.warehouseParam = exports.lookupParam = exports.dateRangeParams = exports.monthStartStr = exports.todayStr = exports.ymd = exports.n = exports.f = void 0;
exports.str = str;
exports.int = int;
exports.bool = bool;
exports.startOf = startOf;
exports.endOf = endOf;
exports.dateFilter = dateFilter;
exports.codeRange = codeRange;
const f = (key, label, type = 'string') => ({ key, label, type });
exports.f = f;
const n = (v) => (v === null || v === undefined ? 0 : Number(v));
exports.n = n;
const TZ = 'Asia/Jakarta';
const ymdFmt = new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' });
const ymd = (d) => (d ? ymdFmt.format(d) : '');
exports.ymd = ymd;
const todayStr = () => ymdFmt.format(new Date());
exports.todayStr = todayStr;
const monthStartStr = () => (0, exports.todayStr)().slice(0, 8) + '01';
exports.monthStartStr = monthStartStr;
function str(p, key) {
    const v = p?.[key];
    if (v === null || v === undefined)
        return undefined;
    const s = String(v).trim();
    return s === '' ? undefined : s;
}
function int(p, key) {
    const s = str(p, key);
    if (s === undefined)
        return undefined;
    const v = Number(s);
    return Number.isFinite(v) ? v : undefined;
}
function bool(p, key) {
    const v = p?.[key];
    return v === true || v === 'true' || v === '1' || v === 1;
}
function startOf(s) {
    if (!s)
        return undefined;
    const d = new Date(`${s.slice(0, 10)}T00:00:00+07:00`);
    return isNaN(d.getTime()) ? undefined : d;
}
function endOf(s) {
    if (!s)
        return undefined;
    const d = new Date(`${s.slice(0, 10)}T23:59:59.999+07:00`);
    return isNaN(d.getTime()) ? undefined : d;
}
function dateFilter(p, fromKey = 'tanggalDari', toKey = 'tanggalSampai') {
    const gte = startOf(str(p, fromKey));
    const lte = endOf(str(p, toKey));
    if (!gte && !lte)
        return undefined;
    return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
}
function codeRange(p, fromKey, toKey) {
    const gte = str(p, fromKey);
    const lte = str(p, toKey);
    if (!gte && !lte)
        return undefined;
    return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) };
}
const dateRangeParams = () => [
    { key: 'tanggalDari', label: 'Tanggal Dari', type: 'date', defaultValue: (0, exports.monthStartStr)() },
    { key: 'tanggalSampai', label: 'Tanggal Sampai', type: 'date', defaultValue: (0, exports.todayStr)() },
];
exports.dateRangeParams = dateRangeParams;
const lookupParam = (key, label, endpoint) => ({
    key,
    label,
    type: 'lookup',
    source: { endpoint, valueField: 'Code', labelField: 'Name', codeField: 'Code' },
});
exports.lookupParam = lookupParam;
const warehouseParam = () => ({
    key: 'gudang',
    label: 'Gudang',
    type: 'select',
    source: { endpoint: 'warehouse', valueField: 'ID', labelField: 'Name' },
});
exports.warehouseParam = warehouseParam;
const paymentStatusParam = () => ({
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
exports.paymentStatusParam = paymentStatusParam;
const daysBetween = (from, to) => Math.floor((to.getTime() - from.getTime()) / 86400000);
exports.daysBetween = daysBetween;
