"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeProviders = exports.balanceSheet = exports.profitLossYtd = exports.profitLoss = exports.worksheet = exports.trialBalance = exports.generalLedger = exports.journalUnbalanced = exports.cashTransfer = exports.accountList = exports.journalList = exports.cashOut = exports.cashIn = void 0;
const report_engine_types_1 = require("../report-engine.types");
const helpers_1 = require("../helpers");
const ledger_1 = require("../../../common/accounting/ledger");
const accountSelect = {
    endpoint: 'account', valueField: 'ID', labelField: 'Name',
};
function cashProvider(kind) {
    const isIn = kind === 'in';
    return {
        key: isIn ? 'cash-in' : 'cash-out',
        group: 'Kas',
        title: isIn ? 'Laporan Kas Masuk' : 'Laporan Kas Keluar',
        description: isIn ? 'Daftar penerimaan kas pada periode.' : 'Daftar pengeluaran kas pada periode.',
        required: ['tanggalDari', 'tanggalSampai'],
        params: [...(0, helpers_1.dateRangeParams)(), { key: 'akun', label: 'Akun', type: 'select', source: accountSelect }],
        fields: [
            (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('kodeakun', 'Kode Akun'), (0, helpers_1.f)('akun', 'Akun'),
            (0, helpers_1.f)('jumlah', 'Jumlah', 'currency'), (0, helpers_1.f)('keterangan', 'Keterangan'), (0, helpers_1.f)('referensi', 'Referensi'),
        ],
        async run(p, ctx) {
            const acc = (0, helpers_1.int)(p, 'akun');
            const where = { Date: (0, helpers_1.dateFilter)(p), ...(acc ? { AccountID: acc } : {}) };
            const model = isIn ? ctx.prisma.cashIn : ctx.prisma.cashOut;
            const rows = await model.findMany({
                where, include: { Account: { select: { Code: true, Name: true } } }, orderBy: [{ Date: 'asc' }, { ID: 'asc' }], take: report_engine_types_1.MAX_ROWS,
            });
            return rows.map((x) => ({
                kode: x.Code, tanggal: (0, helpers_1.ymd)(x.Date), kodeakun: x.Account.Code, akun: x.Account.Name, jumlah: (0, helpers_1.n)(x.Amount),
                keterangan: x.Description ?? '', referensi: x.ReferenceType ? `${x.ReferenceType}${x.ReferenceID ? ' #' + x.ReferenceID : ''}` : '',
            }));
        },
    };
}
exports.cashIn = cashProvider('in');
exports.cashOut = cashProvider('out');
exports.journalList = {
    key: 'journal-list',
    group: 'Jurnal',
    title: 'Laporan Daftar Jurnal',
    description: 'Jurnal umum per baris (akun, debit, kredit).',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [
        ...(0, helpers_1.dateRangeParams)(),
        (0, helpers_1.lookupParam)('akun', 'Akun', 'account'),
        {
            key: 'posting', label: 'Status Posting', type: 'select', defaultValue: '',
            options: [{ value: '', label: 'Semua' }, { value: 'posted', label: 'Sudah Posting' }, { value: 'draft', label: 'Belum Posting' }],
        },
    ],
    fields: [
        (0, helpers_1.f)('kode', 'Kode Jurnal'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('keterangan', 'Keterangan'), (0, helpers_1.f)('kodeakun', 'Kode Akun'),
        (0, helpers_1.f)('akun', 'Akun'), (0, helpers_1.f)('debit', 'Debit', 'currency'), (0, helpers_1.f)('kredit', 'Kredit', 'currency'), (0, helpers_1.f)('memo', 'Memo'), (0, helpers_1.f)('status', 'Status'),
    ],
    async run(p, ctx) {
        const journal = { Date: (0, helpers_1.dateFilter)(p) };
        const posting = (0, helpers_1.str)(p, 'posting');
        if (posting === 'posted')
            journal.IsPosted = true;
        if (posting === 'draft')
            journal.IsPosted = false;
        const akun = (0, helpers_1.str)(p, 'akun');
        const rows = await ctx.prisma.journalEntryLine.findMany({
            where: { JournalEntry: { Journal: journal }, ...(akun ? { Account: { Code: akun } } : {}) },
            include: { JournalEntry: { include: { Journal: true } }, Account: { select: { Code: true, Name: true } } },
            orderBy: [{ JournalEntry: { Journal: { Date: 'asc' } } }, { JournalEntryID: 'asc' }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            kode: x.JournalEntry.Journal.Code, tanggal: (0, helpers_1.ymd)(x.JournalEntry.Journal.Date), keterangan: x.JournalEntry.Journal.Description ?? '', kodeakun: x.Account.Code,
            akun: x.Account.Name, debit: (0, helpers_1.n)(x.Debit), kredit: (0, helpers_1.n)(x.Credit), memo: x.Description ?? '', status: x.JournalEntry.Journal.IsPosted ? 'Posted' : 'Draft',
        }));
    },
};
exports.accountList = {
    key: 'account-list',
    group: 'Daftar Perkiraan',
    title: 'Laporan Daftar Perkiraan',
    description: 'Daftar akun (chart of accounts).',
    params: [],
    fields: [(0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('nama', 'Nama Perkiraan'), (0, helpers_1.f)('tipe', 'Tipe'), (0, helpers_1.f)('induk', 'Induk'), (0, helpers_1.f)('aktif', 'Aktif')],
    async run(_p, ctx) {
        const rows = await ctx.prisma.account.findMany({
            include: { Type: { select: { Name: true } }, Parent: { select: { Code: true, Name: true } } },
            orderBy: { Code: 'asc' },
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            kode: x.Code, nama: x.Name, tipe: x.Type?.Name ?? '', induk: x.Parent ? `${x.Parent.Code} - ${x.Parent.Name}` : '', aktif: x.IsActive ? 'Ya' : 'Tidak',
        }));
    },
};
const PNL_TYPES = ['REVENUE', 'EXPENSE', 'COST'];
const r2 = (v) => Math.round(v * 100) / 100;
async function loadMovements(prisma, opts) {
    const dateCond = {};
    if (opts.from)
        dateCond.gte = opts.from;
    if (opts.to)
        dateCond.lte = opts.to;
    const hasDate = Object.keys(dateCond).length > 0;
    const lines = await prisma.journalEntryLine.findMany({
        where: {
            JournalEntry: { Journal: { ...(opts.includeDraft ? {} : { IsPosted: true }), ...(hasDate ? { Date: dateCond } : {}) } },
        },
        select: {
            Debit: true, Credit: true, Description: true,
            Account: { select: { ID: true, Code: true, Name: true, Type: { select: { Code: true, Name: true, IsDebitNormal: true } } } },
            JournalEntry: { select: { Journal: { select: { Code: true, Date: true, Description: true, ReferenceType: true } } } },
        },
        take: report_engine_types_1.MAX_ROWS * 10,
    });
    const out = [];
    for (const l of lines) {
        const j = l.JournalEntry?.Journal;
        if (!j || j.ReferenceType === ledger_1.OPENING_REF)
            continue;
        const a = l.Account;
        out.push({
            accountId: a.ID, code: a.Code, name: a.Name, typeCode: a.Type?.Code ?? '', typeName: a.Type?.Name ?? '',
            debitNormal: a.Type?.IsDebitNormal ?? true, date: j.Date, debit: (0, helpers_1.n)(l.Debit), credit: (0, helpers_1.n)(l.Credit),
            desc: l.Description || j.Description || '', ref: j.ReferenceType ?? '', docCode: j.Code, close: j.ReferenceType === ledger_1.CLOSING_REF,
        });
    }
    const obs = await prisma.openingBalance.findMany({
        where: (0, ledger_1.openingRowsWhere)(hasDate ? dateCond : undefined),
        include: { Account: { select: { ID: true, Code: true, Name: true, Type: { select: { Code: true, Name: true, IsDebitNormal: true } } } } },
    });
    for (const o of obs) {
        const a = o.Account;
        if (!a)
            continue;
        out.push({
            accountId: a.ID, code: a.Code, name: a.Name, typeCode: a.Type?.Code ?? '', typeName: a.Type?.Name ?? '',
            debitNormal: a.Type?.IsDebitNormal ?? true, date: o.Date, debit: (0, helpers_1.n)(o.Debit), credit: (0, helpers_1.n)(o.Credit),
            desc: o.Notes || 'Saldo Awal', ref: 'OPENING_BALANCE', docCode: o.Reference ?? 'Saldo Awal', close: false,
        });
    }
    return out;
}
function aggregate(mvs, skip) {
    const map = new Map();
    for (const m of mvs) {
        if (skip?.(m))
            continue;
        const g = map.get(m.accountId) ?? { code: m.code, name: m.name, typeCode: m.typeCode, typeName: m.typeName, debitNormal: m.debitNormal, debit: 0, credit: 0 };
        g.debit += m.debit;
        g.credit += m.credit;
        map.set(m.accountId, g);
    }
    return map;
}
const byCode = (a, b) => a.code.localeCompare(b.code);
const nat = (a) => (a.debitNormal ? a.debit - a.credit : a.credit - a.debit);
exports.cashTransfer = {
    key: 'cash-transfer',
    group: 'Kas',
    title: 'Laporan Kas Transfer',
    description: 'Daftar transfer antar akun kas pada periode.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [...(0, helpers_1.dateRangeParams)(), { key: 'akun', label: 'Akun (asal / tujuan)', type: 'select', source: accountSelect }],
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('dariKode', 'Kode Akun Asal'), (0, helpers_1.f)('dari', 'Akun Asal'),
        (0, helpers_1.f)('keKode', 'Kode Akun Tujuan'), (0, helpers_1.f)('ke', 'Akun Tujuan'), (0, helpers_1.f)('jumlah', 'Jumlah', 'currency'), (0, helpers_1.f)('keterangan', 'Keterangan'),
    ],
    async run(p, ctx) {
        const acc = (0, helpers_1.int)(p, 'akun');
        const rows = await ctx.prisma.cashTransfer.findMany({
            where: { Date: (0, helpers_1.dateFilter)(p), ...(acc ? { OR: [{ FromAccountID: acc }, { ToAccountID: acc }] } : {}) },
            include: { FromAccount: { select: { Code: true, Name: true } }, ToAccount: { select: { Code: true, Name: true } } },
            orderBy: [{ Date: 'asc' }, { ID: 'asc' }], take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            kode: x.Code, tanggal: (0, helpers_1.ymd)(x.Date), dariKode: x.FromAccount.Code, dari: x.FromAccount.Name, keKode: x.ToAccount.Code,
            ke: x.ToAccount.Name, jumlah: (0, helpers_1.n)(x.Amount), keterangan: x.Description ?? '',
        }));
    },
};
exports.journalUnbalanced = {
    key: 'journal-unbalanced',
    group: 'Jurnal',
    title: 'Analisa Jurnal Tidak Seimbang',
    description: 'Jurnal yang total debit dan kreditnya tidak sama.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: (0, helpers_1.dateRangeParams)(),
    fields: [
        (0, helpers_1.f)('kode', 'Kode Jurnal'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('keterangan', 'Keterangan'), (0, helpers_1.f)('debit', 'Total Debit', 'currency'),
        (0, helpers_1.f)('kredit', 'Total Kredit', 'currency'), (0, helpers_1.f)('selisih', 'Selisih', 'currency'), (0, helpers_1.f)('status', 'Status'),
    ],
    async run(p, ctx) {
        const journals = await ctx.prisma.journal.findMany({
            where: { Date: (0, helpers_1.dateFilter)(p) },
            select: { Code: true, Date: true, Description: true, IsPosted: true, JournalEntries: { select: { Lines: { select: { Debit: true, Credit: true } } } } },
            orderBy: [{ Date: 'asc' }, { ID: 'asc' }], take: report_engine_types_1.MAX_ROWS,
        });
        const out = [];
        for (const j of journals) {
            let d = 0, c = 0;
            for (const e of j.JournalEntries)
                for (const l of e.Lines) {
                    d += (0, helpers_1.n)(l.Debit);
                    c += (0, helpers_1.n)(l.Credit);
                }
            if (Math.abs(d - c) > 0.005) {
                out.push({ kode: j.Code, tanggal: (0, helpers_1.ymd)(j.Date), keterangan: j.Description ?? '', debit: r2(d), kredit: r2(c), selisih: r2(d - c), status: j.IsPosted ? 'Posted' : 'Draft' });
            }
        }
        return out;
    },
};
const accLookup = { endpoint: 'account', valueField: 'Code', labelField: 'Name', codeField: 'Code' };
exports.generalLedger = {
    key: 'general-ledger',
    group: 'Buku Besar',
    title: 'Buku Besar',
    description: 'Mutasi per akun dengan saldo awal dan saldo berjalan (hanya jurnal posted).',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [
        ...(0, helpers_1.dateRangeParams)(),
        { key: 'akunDari', label: 'Akun Dari', type: 'lookup', source: accLookup },
        { key: 'akunSampai', label: 'Akun Sampai', type: 'lookup', source: accLookup, rangeWith: 'akunDari' },
    ],
    fields: [
        (0, helpers_1.f)('kodeakun', 'Kode Akun'), (0, helpers_1.f)('akun', 'Akun'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('kode', 'No. Bukti'), (0, helpers_1.f)('keterangan', 'Keterangan'),
        (0, helpers_1.f)('debit', 'Debit', 'currency'), (0, helpers_1.f)('kredit', 'Kredit', 'currency'), (0, helpers_1.f)('saldo', 'Saldo', 'currency'),
    ],
    async run(p, ctx) {
        const from = (0, helpers_1.startOf)((0, helpers_1.str)(p, 'tanggalDari')), to = (0, helpers_1.endOf)((0, helpers_1.str)(p, 'tanggalSampai'));
        const lo = (0, helpers_1.str)(p, 'akunDari'), hi = (0, helpers_1.str)(p, 'akunSampai');
        const mvs = (await loadMovements(ctx.prisma, { to })).filter((m) => (!lo || m.code >= lo) && (!hi || m.code <= hi));
        const groups = new Map();
        for (const m of mvs) {
            const a = groups.get(m.accountId) ?? [];
            a.push(m);
            groups.set(m.accountId, a);
        }
        const rows = [];
        const list = [...groups.values()].sort((a, b) => a[0].code.localeCompare(b[0].code));
        for (const g of list) {
            const first = g[0];
            const sign = first.debitNormal ? 1 : -1;
            const opening = g.filter((m) => from && m.date < from).reduce((s, m) => s + sign * (m.debit - m.credit), 0);
            const inRange = g.filter((m) => !from || m.date >= from).sort((a, b) => a.date.getTime() - b.date.getTime());
            if (inRange.length === 0 && Math.abs(opening) < 0.005)
                continue;
            let run = opening;
            rows.push({ kodeakun: first.code, akun: first.name, tanggal: from ? (0, helpers_1.ymd)(from) : '', kode: '', keterangan: 'Saldo Awal', debit: 0, kredit: 0, saldo: r2(run) });
            for (const m of inRange) {
                run += sign * (m.debit - m.credit);
                rows.push({ kodeakun: first.code, akun: first.name, tanggal: (0, helpers_1.ymd)(m.date), kode: m.docCode, keterangan: m.desc, debit: m.debit, kredit: m.credit, saldo: r2(run) });
            }
            rows.push({
                kodeakun: first.code, akun: first.name, tanggal: '', kode: '', keterangan: 'Total / Saldo Akhir',
                debit: r2(inRange.reduce((s, m) => s + m.debit, 0)), kredit: r2(inRange.reduce((s, m) => s + m.credit, 0)), saldo: r2(run),
            });
        }
        return rows;
    },
};
exports.trialBalance = {
    key: 'trial-balance',
    group: 'Keuangan',
    title: 'Laporan Neraca Saldo',
    description: 'Total debit dan kredit per akun dari jurnal (jurnal posted + saldo awal akun; centang untuk menyertakan draft).',
    required: ['tanggalSampai'],
    params: [
        { key: 'tanggalDari', label: 'Tanggal Dari', type: 'date', rangeWith: 'tanggalSampai' },
        { key: 'tanggalSampai', label: 'Tanggal Sampai', type: 'date', defaultValue: (0, helpers_1.todayStr)() },
        { key: 'semuaJurnal', label: 'Termasuk jurnal belum posting', type: 'checkbox', defaultValue: false },
    ],
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('nama', 'Nama Perkiraan'), (0, helpers_1.f)('tipe', 'Tipe'),
        (0, helpers_1.f)('debit', 'Debit', 'currency'), (0, helpers_1.f)('kredit', 'Kredit', 'currency'), (0, helpers_1.f)('saldo', 'Saldo (Debit - Kredit)', 'currency'),
    ],
    async run(p, ctx) {
        const mvs = await loadMovements(ctx.prisma, { from: (0, helpers_1.startOf)((0, helpers_1.str)(p, 'tanggalDari')), to: (0, helpers_1.endOf)((0, helpers_1.str)(p, 'tanggalSampai')), includeDraft: (0, helpers_1.bool)(p, 'semuaJurnal') });
        return [...aggregate(mvs).values()]
            .map((a) => ({ kode: a.code, nama: a.name, tipe: a.typeName, debit: r2(a.debit), kredit: r2(a.credit), saldo: r2(a.debit - a.credit) }))
            .sort((a, b) => a.kode.localeCompare(b.kode));
    },
};
exports.worksheet = {
    key: 'worksheet',
    group: 'Buku Besar',
    title: 'Neraca Lajur',
    description: 'Kertas kerja: saldo awal, mutasi, neraca saldo, laba rugi dan neraca per akun.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [
        ...(0, helpers_1.dateRangeParams)(),
        { key: 'pembagi', label: 'Pembagi Nilai', type: 'select', defaultValue: '1', options: [{ value: '1', label: '1' }, { value: '1000', label: '1.000' }, { value: '1000000', label: '1.000.000' }] },
    ],
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('nama', 'Nama Perkiraan'),
        (0, helpers_1.f)('awalD', 'Saldo Awal Debit', 'currency'), (0, helpers_1.f)('awalK', 'Saldo Awal Kredit', 'currency'),
        (0, helpers_1.f)('mutD', 'Mutasi Debit', 'currency'), (0, helpers_1.f)('mutK', 'Mutasi Kredit', 'currency'),
        (0, helpers_1.f)('nsD', 'Neraca Saldo Debit', 'currency'), (0, helpers_1.f)('nsK', 'Neraca Saldo Kredit', 'currency'),
        (0, helpers_1.f)('lrD', 'Laba Rugi Debit', 'currency'), (0, helpers_1.f)('lrK', 'Laba Rugi Kredit', 'currency'),
        (0, helpers_1.f)('nrD', 'Neraca Debit', 'currency'), (0, helpers_1.f)('nrK', 'Neraca Kredit', 'currency'),
    ],
    async run(p, ctx) {
        const from = (0, helpers_1.startOf)((0, helpers_1.str)(p, 'tanggalDari')), to = (0, helpers_1.endOf)((0, helpers_1.str)(p, 'tanggalSampai'));
        const div = Math.max(1, (0, helpers_1.int)(p, 'pembagi') ?? 1);
        const mvs = await loadMovements(ctx.prisma, { to });
        const accs = new Map();
        for (const m of mvs) {
            const a = accs.get(m.accountId) ?? { code: m.code, name: m.name, typeCode: m.typeCode, od: 0, oc: 0, md: 0, mc: 0 };
            if (from && m.date < from) {
                a.od += m.debit;
                a.oc += m.credit;
            }
            else if (!(PNL_TYPES.includes(m.typeCode) && m.close)) {
                a.md += m.debit;
                a.mc += m.credit;
            }
            accs.set(m.accountId, a);
        }
        const rows = [];
        const tot = { awalD: 0, awalK: 0, mutD: 0, mutK: 0, nsD: 0, nsK: 0, lrD: 0, lrK: 0, nrD: 0, nrK: 0 };
        const split = (net) => (net >= 0 ? [net, 0] : [0, -net]);
        for (const a of [...accs.values()].sort(byCode)) {
            const [awalD, awalK] = split(a.od - a.oc);
            const [nsD, nsK] = split(a.od - a.oc + a.md - a.mc);
            const isPnl = PNL_TYPES.includes(a.typeCode);
            const r = {
                kode: a.code, nama: a.name, awalD, awalK, mutD: a.md, mutK: a.mc, nsD, nsK,
                lrD: isPnl ? nsD : 0, lrK: isPnl ? nsK : 0, nrD: isPnl ? 0 : nsD, nrK: isPnl ? 0 : nsK,
            };
            if (Object.keys(tot).every((k) => Math.abs(r[k]) < 0.005))
                continue;
            for (const k of Object.keys(tot))
                tot[k] += r[k];
            rows.push(r);
        }
        const laba = tot.lrK - tot.lrD;
        const adj = {
            kode: '', nama: laba >= 0 ? 'Laba Berjalan' : 'Rugi Berjalan', awalD: 0, awalK: 0, mutD: 0, mutK: 0, nsD: 0, nsK: 0,
            lrD: laba >= 0 ? laba : 0, lrK: laba < 0 ? -laba : 0, nrD: laba < 0 ? -laba : 0, nrK: laba >= 0 ? laba : 0,
        };
        rows.push(adj);
        tot.lrD += adj.lrD;
        tot.lrK += adj.lrK;
        tot.nrD += adj.nrD;
        tot.nrK += adj.nrK;
        rows.push({ kode: '', nama: 'TOTAL', ...tot });
        return rows.map((r) => {
            const o = { ...r };
            for (const k of Object.keys(o))
                if (typeof o[k] === 'number')
                    o[k] = r2(o[k] / div);
            return o;
        });
    },
};
async function profitLossRows(prisma, from, to) {
    const mvs = await loadMovements(prisma, { from, to });
    const aggs = [...aggregate(mvs, (m) => m.close || !PNL_TYPES.includes(m.typeCode)).values()].sort(byCode);
    const sections = [
        { type: 'REVENUE', label: 'PENDAPATAN' }, { type: 'COST', label: 'HARGA POKOK PENJUALAN' }, { type: 'EXPENSE', label: 'BEBAN' },
    ];
    const rows = [];
    const total = {};
    for (const s of sections) {
        rows.push({ kelompok: s.label, kode: '', nama: s.label, jumlah: null });
        let sum = 0;
        for (const a of aggs.filter((x) => x.typeCode === s.type)) {
            const v = nat(a);
            sum += v;
            rows.push({ kelompok: s.label, kode: a.code, nama: a.name, jumlah: r2(v) });
        }
        total[s.type] = sum;
        rows.push({ kelompok: s.label, kode: '', nama: `Total ${s.label}`, jumlah: r2(sum) });
        if (s.type === 'COST')
            rows.push({ kelompok: 'LABA KOTOR', kode: '', nama: 'LABA KOTOR', jumlah: r2(total.REVENUE - sum) });
    }
    rows.push({ kelompok: 'LABA BERSIH', kode: '', nama: 'LABA (RUGI) BERSIH', jumlah: r2(total.REVENUE - total.COST - total.EXPENSE) });
    return rows;
}
const plFields = [(0, helpers_1.f)('kelompok', 'Kelompok'), (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('nama', 'Keterangan'), (0, helpers_1.f)('jumlah', 'Jumlah', 'currency')];
exports.profitLoss = {
    key: 'laba-rugi',
    group: 'Keuangan',
    title: 'Laporan Laba Rugi',
    description: 'Pendapatan, harga pokok dan beban pada periode (jurnal posted; jurnal tutup tahun tidak dihitung).',
    required: ['tanggalDari', 'tanggalSampai'],
    params: (0, helpers_1.dateRangeParams)(),
    fields: plFields,
    run: (p, ctx) => profitLossRows(ctx.prisma, (0, helpers_1.startOf)((0, helpers_1.str)(p, 'tanggalDari')), (0, helpers_1.endOf)((0, helpers_1.str)(p, 'tanggalSampai'))),
};
exports.profitLossYtd = {
    key: 'laba-rugi-ytd',
    group: 'Keuangan',
    title: 'Laporan Laba Rugi YTD',
    description: 'Laba rugi dari awal tahun buku (1 Januari) sampai tanggal yang dipilih.',
    required: ['tanggalSampai'],
    params: [{ key: 'tanggalSampai', label: 'Sampai Tanggal', type: 'date', defaultValue: (0, helpers_1.todayStr)() }],
    fields: plFields,
    run: (p, ctx) => {
        const to = (0, helpers_1.str)(p, 'tanggalSampai');
        return profitLossRows(ctx.prisma, (0, helpers_1.startOf)(`${to.slice(0, 4)}-01-01`), (0, helpers_1.endOf)(to));
    },
};
exports.balanceSheet = {
    key: 'neraca',
    group: 'Keuangan',
    title: 'Laporan Neraca',
    description: 'Posisi aktiva, kewajiban dan modal per tanggal (jurnal posted).',
    required: ['tanggalSampai'],
    params: [{ key: 'tanggalSampai', label: 'Per Tanggal', type: 'date', defaultValue: (0, helpers_1.todayStr)() }],
    fields: [(0, helpers_1.f)('kelompok', 'Kelompok'), (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('nama', 'Keterangan'), (0, helpers_1.f)('jumlah', 'Jumlah', 'currency')],
    async run(p, ctx) {
        const mvs = await loadMovements(ctx.prisma, { to: (0, helpers_1.endOf)((0, helpers_1.str)(p, 'tanggalSampai')) });
        const aggs = [...aggregate(mvs).values()].sort(byCode);
        const rows = [];
        const sections = [{ type: 'ASSET', label: 'AKTIVA' }, { type: 'LIABILITY', label: 'KEWAJIBAN' }, { type: 'EQUITY', label: 'MODAL' }];
        const tot = {};
        for (const s of sections) {
            rows.push({ kelompok: s.label, kode: '', nama: s.label, jumlah: null });
            let sum = 0;
            for (const a of aggs.filter((x) => x.typeCode === s.type)) {
                const v = nat(a);
                if (Math.abs(v) < 0.005)
                    continue;
                sum += v;
                rows.push({ kelompok: s.label, kode: a.code, nama: a.name, jumlah: r2(v) });
            }
            if (s.type === 'EQUITY') {
                const laba = aggs.filter((x) => PNL_TYPES.includes(x.typeCode)).reduce((t, a) => t + (a.credit - a.debit), 0);
                sum += laba;
                rows.push({ kelompok: s.label, kode: '', nama: 'Laba (Rugi) Berjalan', jumlah: r2(laba) });
            }
            tot[s.type] = sum;
            rows.push({ kelompok: s.label, kode: '', nama: `Total ${s.label}`, jumlah: r2(sum) });
        }
        rows.push({ kelompok: 'TOTAL', kode: '', nama: 'TOTAL KEWAJIBAN + MODAL', jumlah: r2(tot.LIABILITY + tot.EQUITY) });
        rows.push({ kelompok: 'TOTAL', kode: '', nama: 'SELISIH (AKTIVA - KEWAJIBAN - MODAL)', jumlah: r2(tot.ASSET - tot.LIABILITY - tot.EQUITY) });
        return rows;
    },
};
exports.financeProviders = [
    exports.cashIn, exports.cashOut, exports.cashTransfer, exports.journalList, exports.journalUnbalanced, exports.generalLedger, exports.worksheet,
    exports.trialBalance, exports.profitLoss, exports.profitLossYtd, exports.balanceSheet, exports.accountList,
];
