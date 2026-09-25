"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receivableProviders = exports.debtProviders = exports.receivableOutstanding = exports.debtOutstanding = void 0;
const report_engine_types_1 = require("../report-engine.types");
const helpers_1 = require("../helpers");
const OPEN_STATUSES = ['PENDING', 'PARTIAL', 'OVERDUE'];
function commonParams(kind) {
    const isSup = kind === 'supplier';
    return [
        { key: 'tanggalSampai', label: 'Tanggal Sampai', type: 'date', defaultValue: (0, helpers_1.todayStr)() },
        { key: 'tanggalDari', label: 'Tanggal Dari', type: 'date', rangeWith: 'tanggalSampai' },
        (0, helpers_1.lookupParam)('supplierDari'.replace('supplier', kind), `${isSup ? 'Supplier' : 'Pelanggan'} Dari`, kind),
        (0, helpers_1.lookupParam)('supplierSampai'.replace('supplier', kind), `${isSup ? 'Supplier' : 'Pelanggan'} Sampai`, kind),
        {
            key: 'modul',
            label: 'Modul',
            type: 'select',
            defaultValue: '',
            options: [
                { value: '', label: 'Semua' },
                { value: 'transaksi', label: isSup ? 'Pembelian' : 'Penjualan' },
            ],
        },
        (0, helpers_1.warehouseParam)(),
    ];
}
const fields = (who) => [
    (0, helpers_1.f)('kodepihak', `Kode ${who}`), (0, helpers_1.f)('pihak', who), (0, helpers_1.f)('kode', 'Kode Transaksi'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'),
    (0, helpers_1.f)('jatuhtempo', 'Jatuh Tempo', 'date'), (0, helpers_1.f)('total', 'Total', 'currency'), (0, helpers_1.f)('dibayar', 'Dibayar', 'currency'),
    (0, helpers_1.f)('sisa', 'Sisa', 'currency'), (0, helpers_1.f)('umur', 'Umur (hari)', 'number'),
];
const variants = (label) => [
    { key: 'outstanding', title: `Laporan ${label} Beredar` },
    { key: 'overdue', title: `Laporan ${label} Beredar Sudah Jatuh Tempo` },
];
function build(kind) {
    const isSup = kind === 'supplier';
    const dari = `${kind}Dari`;
    const sampai = `${kind}Sampai`;
    return async (p, ctx) => {
        const asOf = (0, helpers_1.endOf)((0, helpers_1.str)(p, 'tanggalSampai') ?? (0, helpers_1.todayStr)());
        const from = (0, helpers_1.startOf)((0, helpers_1.str)(p, 'tanggalDari'));
        const modul = (0, helpers_1.str)(p, 'modul');
        if (modul && modul !== 'transaksi')
            return [];
        const g = (0, helpers_1.int)(p, 'gudang');
        const range = (0, helpers_1.codeRange)(p, dari, sampai);
        const where = {
            Date: { lte: asOf, ...(from ? { gte: from } : {}) },
            PaymentStatus: { Code: { in: OPEN_STATUSES } },
            ...(g ? { WarehouseID: g } : {}),
            ...(range ? { [isSup ? 'Supplier' : 'Customer']: { Code: range } } : {}),
        };
        if (isSup)
            where.Status = { Code: { notIn: ['CANCELLED', 'REJECTED'] } };
        const rows = await (isSup ? ctx.prisma.purchase : ctx.prisma.sale).findMany({
            where,
            include: {
                [isSup ? 'Supplier' : 'Customer']: { select: { Code: true, Name: true } },
                [isSup ? 'PurchasePayments' : 'SalePayments']: { select: { Amount: true, Date: true } },
            },
            orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        const out = [];
        for (const x of rows) {
            const party = isSup ? x.Supplier : x.Customer;
            const payments = isSup ? x.PurchasePayments : x.SalePayments;
            const paid = payments.filter((y) => y.Date <= asOf).reduce((s, y) => s + (0, helpers_1.n)(y.Amount), 0);
            const total = (0, helpers_1.n)(x.Total);
            const sisa = total - paid;
            if (sisa <= 0.005)
                continue;
            const due = (isSup ? x.DueDate : null) ?? x.Date;
            out.push({
                kodepihak: party.Code, pihak: party.Name, kode: x.Code, tanggal: (0, helpers_1.ymd)(x.Date), jatuhtempo: (0, helpers_1.ymd)(due),
                total, dibayar: paid, sisa, umur: Math.max(0, (0, helpers_1.daysBetween)(x.Date, asOf)),
                _due: due,
            });
        }
        return out;
    };
}
function provider(kind) {
    const isSup = kind === 'supplier';
    const label = isSup ? 'Hutang' : 'Piutang';
    const runner = build(kind);
    return {
        key: isSup ? 'debt-outstanding' : 'receivable-outstanding',
        group: label,
        title: `Laporan ${label} Beredar`,
        description: isSup
            ? 'Hutang kepada supplier yang belum lunas per tanggal tertentu.'
            : 'Piutang dari pelanggan yang belum lunas per tanggal tertentu.',
        params: commonParams(kind),
        fields: fields(isSup ? 'Supplier' : 'Pelanggan'),
        variants: variants(label),
        async run(p, ctx) {
            const rows = await runner(p, ctx);
            const asOf = (0, helpers_1.endOf)((0, helpers_1.str)(p, 'tanggalSampai') ?? (0, helpers_1.todayStr)());
            const filtered = ctx.variant === 'overdue' ? rows.filter((r) => (0, helpers_1.ymd)(r._due) < (0, helpers_1.ymd)(asOf)) : rows;
            return filtered.map(({ _due, ...r }) => r);
        },
    };
}
exports.debtOutstanding = provider('supplier');
exports.receivableOutstanding = provider('customer');
const paidOf = (d, asOf) => d.pays.filter((y) => y.date <= asOf).reduce((s, y) => s + y.amount, 0);
async function loadDocs(kind, p, ctx, o) {
    const isSup = kind === 'supplier';
    const g = (0, helpers_1.int)(p, 'gudang');
    const range = (0, helpers_1.codeRange)(p, `${kind}Dari`, `${kind}Sampai`);
    const modul = (0, helpers_1.str)(p, 'modul');
    if (modul && modul !== 'transaksi')
        return [];
    const partyKey = isSup ? 'Supplier' : 'Customer';
    const partySel = { Code: true, Name: true, ...(isSup ? {} : { CustomerGroup: { select: { Code: true, Name: true } } }) };
    const where = {
        Date: { lte: o.asOf, ...(o.dateFrom ? { gte: o.dateFrom } : {}) },
        ...(g ? { WarehouseID: g } : {}),
        ...(range ? { [partyKey]: { Code: range } } : {}),
    };
    if (isSup)
        where.Status = { Code: { notIn: ['CANCELLED', 'REJECTED'] } };
    if (!isSup && o.salesRange)
        where.SalesPerson = { Code: o.salesRange };
    const payKey = isSup ? 'PurchasePayments' : 'SalePayments';
    const rows = await (isSup ? ctx.prisma.purchase : ctx.prisma.sale).findMany({
        where,
        include: {
            [partyKey]: { select: partySel },
            ...(isSup ? {} : { SalesPerson: { select: { Code: true, Name: true } } }),
            [payKey]: {
                where: { IsCleared: true },
                select: { Amount: true, Date: true, InstrumentType: true, ReferenceNumber: true, Notes: true, Method: { select: { Name: true } } },
            },
        },
        orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
        take: report_engine_types_1.MAX_ROWS,
    });
    const docs = [];
    for (const x of rows) {
        const party = x[partyKey];
        const sign = x.IsReturn ? -1 : 1;
        const doc = {
            pihakKode: party.Code, pihak: party.Name, kode: x.Code, date: x.Date,
            due: (isSup ? x.DueDate : null) ?? x.Date, total: sign * (0, helpers_1.n)(x.Total), opening: false,
            pays: x[payKey].map((y) => ({
                date: y.Date, amount: (0, helpers_1.n)(y.Amount), kode: x.Code, metode: y.Method?.Name ?? '',
                instrumen: y.InstrumentType ?? 'CASH', ref: y.ReferenceNumber ?? '', notes: y.Notes ?? '',
            })),
            sales: x.SalesPerson ? { code: x.SalesPerson.Code, name: x.SalesPerson.Name } : undefined,
            group: party.CustomerGroup ? { code: party.CustomerGroup.Code, name: party.CustomerGroup.Name } : undefined,
        };
        if (o.skipInstant && doc.total > 0 && paidOf(doc, o.asOf) >= doc.total - 0.005
            && doc.pays.every((y) => (0, helpers_1.ymd)(y.date) <= (0, helpers_1.ymd)(doc.date)))
            continue;
        docs.push(doc);
    }
    if (!g && !o.salesRange) {
        const ob = await ctx.prisma.openingBalance.findMany({
            where: {
                Type: isSup ? 'DEBT' : 'RECEIVABLE',
                Date: { lte: o.asOf, ...(o.dateFrom ? { gte: o.dateFrom } : {}) },
                ...(range ? { [partyKey]: { Code: range } } : {}),
            },
            include: { [partyKey]: { select: partySel } },
            orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        for (const b of ob) {
            const party = b[partyKey];
            if (!party)
                continue;
            const amt = isSup ? (0, helpers_1.n)(b.Credit) - (0, helpers_1.n)(b.Debit) : (0, helpers_1.n)(b.Debit) - (0, helpers_1.n)(b.Credit);
            docs.push({
                pihakKode: party.Code, pihak: party.Name, kode: b.Reference || 'SALDO AWAL', date: b.Date,
                due: b.DueDate ?? b.Date, total: amt, pays: [], opening: true,
                group: party.CustomerGroup ? { code: party.CustomerGroup.Code, name: party.CustomerGroup.Name } : undefined,
            });
        }
    }
    return docs;
}
function eventsByParty(docs, asOf) {
    const m = new Map();
    for (const d of docs) {
        let e = m.get(d.pihakKode);
        if (!e)
            m.set(d.pihakKode, (e = { kode: d.pihakKode, nama: d.pihak, ev: [] }));
        e.ev.push({ date: d.date, kode: d.kode, ket: d.opening ? 'Saldo Awal' : 'Transaksi', tambah: d.total, bayar: 0 });
        for (const y of d.pays) {
            if (y.date > asOf)
                continue;
            e.ev.push({ date: y.date, kode: d.kode, ket: `Pembayaran ${y.metode}${y.ref ? ' ' + y.ref : ''}`.trim(), tambah: 0, bayar: y.amount });
        }
    }
    const list = [...m.values()].sort((a, b) => a.kode.localeCompare(b.kode));
    for (const e of list)
        e.ev.sort((a, b) => a.date.getTime() - b.date.getTime());
    return list;
}
function baseParams(kind, opts = {}) {
    const who = kind === 'supplier' ? 'Supplier' : 'Pelanggan';
    const ps = [{ key: 'tanggalSampai', label: 'Sampai Tanggal', type: 'date', defaultValue: (0, helpers_1.todayStr)() }];
    if (opts.range)
        ps.push({ key: 'tanggalDari', label: 'Dari Tanggal', type: 'date', rangeWith: 'tanggalSampai' });
    ps.push((0, helpers_1.lookupParam)(`${kind}Dari`, `${who} Dari`, kind), (0, helpers_1.lookupParam)(`${kind}Sampai`, `${who} Sampai`, kind));
    if (opts.modul !== false) {
        ps.push({ key: 'modul', label: 'Modul', type: 'select', defaultValue: '', options: [
                { value: '', label: 'Semua' }, { value: 'transaksi', label: kind === 'supplier' ? 'Pembelian' : 'Penjualan' }
            ] });
    }
    if (opts.extra)
        ps.push(...opts.extra);
    ps.push((0, helpers_1.warehouseParam)());
    return ps;
}
function extProviders(kind) {
    const isSup = kind === 'supplier';
    const label = isSup ? 'Hutang' : 'Piutang';
    const who = isSup ? 'Supplier' : 'Pelanggan';
    const pre = isSup ? 'debt' : 'receivable';
    const asOfOf = (p) => (0, helpers_1.endOf)((0, helpers_1.str)(p, 'tanggalSampai') ?? (0, helpers_1.todayStr)());
    const out = [];
    out.push({
        key: `${pre}-aging`, group: label, title: `Laporan Umur ${label}`,
        description: `${label} yang masih tersisa berdasarkan range umur (0-30, 31-60, 61-90, >90 hari) per ${who.toLowerCase()}.`,
        params: baseParams(kind),
        fields: [(0, helpers_1.f)('kodepihak', `Kode ${who}`), (0, helpers_1.f)('pihak', who), (0, helpers_1.f)('b1', '0-30 hari', 'currency'), (0, helpers_1.f)('b2', '31-60 hari', 'currency'),
            (0, helpers_1.f)('b3', '61-90 hari', 'currency'), (0, helpers_1.f)('b4', '> 90 hari', 'currency'), (0, helpers_1.f)('total', 'Total', 'currency')],
        async run(p, ctx) {
            const asOf = asOfOf(p);
            const docs = await loadDocs(kind, p, ctx, { asOf, skipInstant: true });
            const m = new Map();
            for (const d of docs) {
                const sisa = d.total - paidOf(d, asOf);
                if (Math.abs(sisa) <= 0.005)
                    continue;
                const age = Math.max(0, (0, helpers_1.daysBetween)(d.date, asOf));
                const b = age <= 30 ? 'b1' : age <= 60 ? 'b2' : age <= 90 ? 'b3' : 'b4';
                const r = m.get(d.pihakKode) ?? { kodepihak: d.pihakKode, pihak: d.pihak, b1: 0, b2: 0, b3: 0, b4: 0, total: 0 };
                r[b] += sisa;
                r.total += sisa;
                m.set(d.pihakKode, r);
            }
            return [...m.values()].sort((a, b) => a.kodepihak.localeCompare(b.kodepihak));
        },
    });
    out.push({
        key: `${pre}-ledger`, group: label, title: `Laporan Buku Bantu ${label}`,
        description: `Buku bantu ${label.toLowerCase()} per ${who.toLowerCase()} dengan saldo berjalan.`,
        params: baseParams(kind, { range: true, modul: false }),
        fields: [(0, helpers_1.f)('kodepihak', `Kode ${who}`), (0, helpers_1.f)('pihak', who), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('kode', 'Kode Transaksi'),
            (0, helpers_1.f)('keterangan', 'Keterangan'), (0, helpers_1.f)('tambah', `Tambah ${label}`, 'currency'),
            (0, helpers_1.f)('bayar', 'Pembayaran', 'currency'), (0, helpers_1.f)('saldo', 'Saldo', 'currency')],
        async run(p, ctx) {
            const asOf = asOfOf(p);
            const from = (0, helpers_1.startOf)((0, helpers_1.str)(p, 'tanggalDari'));
            const docs = await loadDocs(kind, p, ctx, { asOf, skipInstant: true });
            const rows = [];
            for (const e of eventsByParty(docs, asOf)) {
                let saldo = 0;
                const before = from ? e.ev.filter((v) => v.date < from) : [];
                if (before.length) {
                    saldo = before.reduce((s, v) => s + v.tambah - v.bayar, 0);
                    rows.push({ kodepihak: e.kode, pihak: e.nama, tanggal: (0, helpers_1.ymd)(from), kode: '', keterangan: 'Saldo Awal', tambah: 0, bayar: 0, saldo });
                }
                for (const v of e.ev.filter((v) => !from || v.date >= from)) {
                    saldo += v.tambah - v.bayar;
                    rows.push({ kodepihak: e.kode, pihak: e.nama, tanggal: (0, helpers_1.ymd)(v.date), kode: v.kode, keterangan: v.ket, tambah: v.tambah, bayar: v.bayar, saldo });
                }
            }
            return rows;
        },
    });
    out.push({
        key: `${pre}-mutation`, group: label, title: `Laporan Mutasi ${label}`,
        description: `Rekap saldo awal, penambahan, pembayaran, dan saldo akhir ${label.toLowerCase()} per ${who.toLowerCase()}.`,
        params: baseParams(kind, { range: true, modul: false }).map((x) => (x.key === 'tanggalDari' ? { ...x, defaultValue: (0, helpers_1.monthStartStr)() } : x)),
        fields: [(0, helpers_1.f)('kodepihak', `Kode ${who}`), (0, helpers_1.f)('pihak', who), (0, helpers_1.f)('awal', 'Saldo Awal', 'currency'), (0, helpers_1.f)('tambah', 'Penambahan', 'currency'),
            (0, helpers_1.f)('bayar', 'Pembayaran', 'currency'), (0, helpers_1.f)('akhir', 'Saldo Akhir', 'currency')],
        async run(p, ctx) {
            const asOf = asOfOf(p);
            const from = (0, helpers_1.startOf)((0, helpers_1.str)(p, 'tanggalDari')) ?? new Date(0);
            const docs = await loadDocs(kind, p, ctx, { asOf, skipInstant: true });
            const rows = [];
            for (const e of eventsByParty(docs, asOf)) {
                let awal = 0, tambah = 0, bayar = 0;
                for (const v of e.ev) {
                    if (v.date < from)
                        awal += v.tambah - v.bayar;
                    else {
                        tambah += v.tambah;
                        bayar += v.bayar;
                    }
                }
                if (!awal && !tambah && !bayar)
                    continue;
                rows.push({ kodepihak: e.kode, pihak: e.nama, awal, tambah, bayar, akhir: awal + tambah - bayar });
            }
            return rows;
        },
    });
    out.push({
        key: `${pre}-per-transaction`, group: label, title: `Laporan Buku ${label} Per Transaksi`,
        description: `Rincian ${label.toLowerCase()} per transaksi beserta rician pembayarannya.`,
        params: baseParams(kind, { range: true, modul: false, extra: [
                { key: 'kodeDari', label: 'No Transaksi Dari', type: 'text' },
                { key: 'kodeSampai', label: 'No Transaksi Sampai', type: 'text' },
                { key: 'lunas', label: 'Status Lunas', type: 'select', defaultValue: '', options: [
                        { value: '', label: 'Semua' }, { value: 'belum', label: 'Belum Lunas' }, { value: 'sudah', label: 'Sudah Lunas' }
                    ] },
            ] }),
        fields: [(0, helpers_1.f)('kodepihak', `Kode ${who}`), (0, helpers_1.f)('pihak', who), (0, helpers_1.f)('kode', 'No Transaksi'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'),
            (0, helpers_1.f)('jatuhtempo', 'Jatuh Tempo', 'date'), (0, helpers_1.f)('keterangan', 'Keterangan'), (0, helpers_1.f)('total', 'Total', 'currency'),
            (0, helpers_1.f)('dibayar', 'Dibayar', 'currency'), (0, helpers_1.f)('sisa', 'Sisa', 'currency')],
        async run(p, ctx) {
            const asOf = asOfOf(p);
            const from = (0, helpers_1.startOf)((0, helpers_1.str)(p, 'tanggalDari'));
            const kd = (0, helpers_1.str)(p, 'kodeDari'), ks = (0, helpers_1.str)(p, 'kodeSampai'), lunas = (0, helpers_1.str)(p, 'lunas');
            const docs = (await loadDocs(kind, p, ctx, { asOf, dateFrom: from }))
                .filter((d) => (!kd || d.kode >= kd) && (!ks || d.kode <= ks))
                .sort((a, b) => a.pihakKode.localeCompare(b.pihakKode) || a.date.getTime() - b.date.getTime());
            const rows = [];
            for (const d of docs) {
                const paid = paidOf(d, asOf);
                const sisa = d.total - paid;
                const isLunas = Math.abs(sisa) <= 0.005;
                if (lunas === 'belum' && isLunas)
                    continue;
                if (lunas === 'sudah' && !isLunas)
                    continue;
                rows.push({ kodepihak: d.pihakKode, pihak: d.pihak, kode: d.kode, tanggal: (0, helpers_1.ymd)(d.date), jatuhtempo: (0, helpers_1.ymd)(d.due),
                    keterangan: d.opening ? 'Saldo Awal' : 'Transaksi', total: d.total, dibayar: paid, sisa });
                for (const y of d.pays.filter((y) => y.date <= asOf)) {
                    rows.push({ kodepihak: d.pihakKode, pihak: d.pihak, kode: d.kode, tanggal: (0, helpers_1.ymd)(y.date), jatuhtempo: '',
                        keterangan: `Pembayaran ${y.metode}${y.ref ? ' ' + y.ref : ''}`.trim(), total: 0, dibayar: y.amount, sisa: 0 });
                }
            }
            return rows;
        },
    });
    out.push({
        key: `${pre}-payments`, group: label, title: `Laporan Pembayaran ${label}`,
        description: `Daftar pembayaran ${label.toLowerCase()} yang sudah cair (cek/BG belum cair tidak dihitung).`,
        params: [
            { key: 'tanggalDari', label: 'Dari Tanggal', type: 'date', defaultValue: (0, helpers_1.monthStartStr)() },
            { key: 'tanggalSampai', label: 'Sampai Tanggal', type: 'date', defaultValue: (0, helpers_1.todayStr)() },
            (0, helpers_1.lookupParam)(`${kind}Dari`, `${who} Dari`, kind), (0, helpers_1.lookupParam)(`${kind}Sampai`, `${who} Sampai`, kind),
            (0, helpers_1.warehouseParam)(),
        ],
        fields: [(0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('kode', 'No Transaksi'), (0, helpers_1.f)('kodepihak', `Kode ${who}`), (0, helpers_1.f)('pihak', who),
            (0, helpers_1.f)('metode', 'Metode'), (0, helpers_1.f)('instrumen', 'Instrumen'), (0, helpers_1.f)('referensi', 'Referensi'), (0, helpers_1.f)('jumlah', 'Jumlah', 'currency'), (0, helpers_1.f)('catatan', 'Catatan')],
        async run(p, ctx) {
            const g = (0, helpers_1.int)(p, 'gudang');
            const range = (0, helpers_1.codeRange)(p, `${kind}Dari`, `${kind}Sampai`);
            const parentKey = isSup ? 'Purchase' : 'Sale';
            const partyKey = isSup ? 'Supplier' : 'Customer';
            const rows = await (isSup ? ctx.prisma.purchasePayment : ctx.prisma.salePayment).findMany({
                where: {
                    IsCleared: true,
                    Date: (0, helpers_1.dateFilter)(p),
                    ...(g || range ? { [parentKey]: { ...(g ? { WarehouseID: g } : {}), ...(range ? { [partyKey]: { Code: range } } : {}) } } : {}),
                },
                include: { [parentKey]: { select: { Code: true, [partyKey]: { select: { Code: true, Name: true } } } }, Method: { select: { Name: true } } },
                orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
                take: report_engine_types_1.MAX_ROWS,
            });
            return rows.map((y) => ({
                tanggal: (0, helpers_1.ymd)(y.Date), kode: y[parentKey].Code, kodepihak: y[parentKey][partyKey].Code, pihak: y[parentKey][partyKey].Name,
                metode: y.Method?.Name ?? '', instrumen: y.InstrumentType, referensi: y.ReferenceNumber ?? '', jumlah: (0, helpers_1.n)(y.Amount), catatan: y.Notes ?? '',
            }));
        },
    });
    if (!isSup) {
        const openRows = async (p, ctx, salesRange) => {
            const asOf = asOfOf(p);
            const docs = await loadDocs('customer', p, ctx, { asOf, skipInstant: true, salesRange });
            return docs.map((d) => ({ d, paid: paidOf(d, asOf) })).filter((x) => Math.abs(x.d.total - x.paid) > 0.005);
        };
        out.push({
            key: 'receivable-per-sales', group: 'Piutang', title: 'Laporan Piutang Per Sales',
            description: 'Piutang beredar yang dikelompokkan berdasarkan sales pada transaksi penjualan.',
            params: [
                { key: 'tanggalSampai', label: 'Sampai Tanggal', type: 'date', defaultValue: (0, helpers_1.todayStr)() },
                (0, helpers_1.lookupParam)('salesDari', 'Sales Dari', 'sales-person'), (0, helpers_1.lookupParam)('salesSampai', 'Sales Sampai', 'sales-person'),
                (0, helpers_1.warehouseParam)(),
            ],
            fields: [(0, helpers_1.f)('kodesales', 'Kode Sales'), (0, helpers_1.f)('sales', 'Sales'), (0, helpers_1.f)('kodepihak', 'Kode Pelanggan'), (0, helpers_1.f)('pihak', 'Pelanggan'),
                (0, helpers_1.f)('kode', 'No Transaksi'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('jatuhtempo', 'Jatuh Tempo', 'date'),
                (0, helpers_1.f)('total', 'Total', 'currency'), (0, helpers_1.f)('dibayar', 'Dibayar', 'currency'), (0, helpers_1.f)('sisa', 'Sisa', 'currency')],
            async run(p, ctx) {
                const items = await openRows(p, ctx, (0, helpers_1.codeRange)(p, 'salesDari', 'salesSampai') ?? {});
                return items
                    .filter((x) => x.d.sales)
                    .map(({ d, paid }) => ({ kodesales: d.sales.code, sales: d.sales.name, kodepihak: d.pihakKode, pihak: d.pihak, kode: d.kode,
                    tanggal: (0, helpers_1.ymd)(d.date), jatuhtempo: (0, helpers_1.ymd)(d.due), total: d.total, dibayar: paid, sisa: d.total - paid }))
                    .sort((a, b) => a.kodesales.localeCompare(b.kodesales) || a.tanggal.localeCompare(b.tanggal));
            },
        });
        out.push({
            key: 'receivable-per-region', group: 'Piutang', title: 'Laporan Piutang Per Wilayah',
            description: 'Piutang beredar per wilayah. Skema belum memiliki master wilayah; sementara dikelompokkan per Kelompok Pelanggan.',
            params: baseParams('customer', { modul: false }),
            fields: [(0, helpers_1.f)('kodewilayah', 'Kode Wilayah (Kelompok Pelanggan)'), (0, helpers_1.f)('wilayah', 'Wilayah (Kelompok Pelanggan)'),
                (0, helpers_1.f)('kodepihak', 'Kode Pelanggan'), (0, helpers_1.f)('pihak', 'Pelanggan'), (0, helpers_1.f)('kode', 'No Transaksi'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'),
                (0, helpers_1.f)('total', 'Total', 'currency'), (0, helpers_1.f)('dibayar', 'Dibayar', 'currency'), (0, helpers_1.f)('sisa', 'Sisa', 'currency')],
            async run(p, ctx) {
                const items = await openRows(p, ctx);
                return items
                    .map(({ d, paid }) => ({ kodewilayah: d.group?.code ?? '-', wilayah: d.group?.name ?? 'Tanpa Wilayah', kodepihak: d.pihakKode,
                    pihak: d.pihak, kode: d.kode, tanggal: (0, helpers_1.ymd)(d.date), total: d.total, dibayar: paid, sisa: d.total - paid }))
                    .sort((a, b) => a.kodewilayah.localeCompare(b.kodewilayah) || a.kodepihak.localeCompare(b.kodepihak));
            },
        });
    }
    return out;
}
exports.debtProviders = [exports.debtOutstanding, ...extProviders('supplier')];
exports.receivableProviders = [exports.receivableOutstanding, ...extProviders('customer')];
