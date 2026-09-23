import { ReportProvider, MAX_ROWS } from '../report-engine.types';
import { f, n, str, int, ymd, bool, dateFilter, dateRangeParams, lookupParam } from '../helpers';

const accountSelect = {
  endpoint: 'account', valueField: 'ID', labelField: 'Name',
} as const;

function cashProvider(kind: 'in' | 'out'): ReportProvider {
  const isIn = kind === 'in';
  return {
    key: isIn ? 'cash-in' : 'cash-out',
    group: 'Kas',
    title: isIn ? 'Laporan Kas Masuk' : 'Laporan Kas Keluar',
    description: isIn ? 'Daftar penerimaan kas pada periode.' : 'Daftar pengeluaran kas pada periode.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [...dateRangeParams(), { key: 'akun', label: 'Akun', type: 'select', source: accountSelect }],
    fields: [
      f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('kodeakun', 'Kode Akun'), f('akun', 'Akun'),
      f('jumlah', 'Jumlah', 'currency'), f('keterangan', 'Keterangan'), f('referensi', 'Referensi'),
    ],
    async run(p, ctx) {
      const acc = int(p, 'akun');
      const where: any = { Date: dateFilter(p), ...(acc ? { AccountID: acc } : {}) };
      const model = isIn ? ctx.prisma.cashIn : ctx.prisma.cashOut;
      const rows: any[] = await (model as any).findMany({
        where, include: { Account: { select: { Code: true, Name: true } } }, orderBy: [{ Date: 'asc' }, { ID: 'asc' }], take: MAX_ROWS,
      });
      return rows.map((x) => ({
        kode: x.Code, tanggal: ymd(x.Date), kodeakun: x.Account.Code, akun: x.Account.Name, jumlah: n(x.Amount),
        keterangan: x.Description ?? '', referensi: x.ReferenceType ? `${x.ReferenceType}${x.ReferenceID ? ' #' + x.ReferenceID : ''}` : '',
      }));
    },
  };
}

export const cashIn = cashProvider('in');
export const cashOut = cashProvider('out');

export const journalList: ReportProvider = {
  key: 'journal-list',
  group: 'Jurnal',
  title: 'Laporan Daftar Jurnal',
  description: 'Jurnal umum per baris (akun, debit, kredit).',
  required: ['tanggalDari', 'tanggalSampai'],
  params: [
    ...dateRangeParams(),
    lookupParam('akun', 'Akun', 'account'),
    {
      key: 'posting', label: 'Status Posting', type: 'select', defaultValue: '',
      options: [{ value: '', label: 'Semua' }, { value: 'posted', label: 'Sudah Posting' }, { value: 'draft', label: 'Belum Posting' }],
    },
  ],
  fields: [
    f('kode', 'Kode Jurnal'), f('tanggal', 'Tanggal', 'date'), f('keterangan', 'Keterangan'), f('kodeakun', 'Kode Akun'),
    f('akun', 'Akun'), f('debit', 'Debit', 'currency'), f('kredit', 'Kredit', 'currency'), f('memo', 'Memo'), f('status', 'Status'),
  ],
  async run(p, ctx) {
    const journal: any = { Date: dateFilter(p) };
    const posting = str(p, 'posting');
    if (posting === 'posted') journal.IsPosted = true;
    if (posting === 'draft') journal.IsPosted = false;
    const akun = str(p, 'akun');
    const rows: any[] = await ctx.prisma.journalEntry.findMany({
      where: { Journal: journal, ...(akun ? { Account: { Code: akun } } : {}) },
      include: { Journal: true, Account: { select: { Code: true, Name: true } } },
      orderBy: [{ Journal: { Date: 'asc' } }, { JournalID: 'asc' }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => ({
      kode: x.Journal.Code, tanggal: ymd(x.Journal.Date), keterangan: x.Journal.Description ?? '', kodeakun: x.Account.Code,
      akun: x.Account.Name, debit: n(x.Debit), kredit: n(x.Credit), memo: x.Memo ?? '', status: x.Journal.IsPosted ? 'Posted' : 'Draft',
    }));
  },
};

export const accountList: ReportProvider = {
  key: 'account-list',
  group: 'Daftar Perkiraan',
  title: 'Laporan Daftar Perkiraan',
  description: 'Daftar akun (chart of accounts).',
  params: [],
  fields: [f('kode', 'Kode'), f('nama', 'Nama Perkiraan'), f('tipe', 'Tipe'), f('induk', 'Induk'), f('aktif', 'Aktif')],
  async run(_p, ctx) {
    const rows: any[] = await ctx.prisma.account.findMany({
      include: { Type: { select: { Name: true } }, Parent: { select: { Code: true, Name: true } } },
      orderBy: { Code: 'asc' },
      take: MAX_ROWS,
    });
    return rows.map((x) => ({
      kode: x.Code, nama: x.Name, tipe: x.Type?.Name ?? '', induk: x.Parent ? `${x.Parent.Code} - ${x.Parent.Name}` : '', aktif: x.IsActive ? 'Ya' : 'Tidak',
    }));
  },
};

export const trialBalance: ReportProvider = {
  key: 'trial-balance',
  group: 'Keuangan',
  title: 'Laporan Neraca Saldo',
  description: 'Total debit dan kredit per akun dari jurnal (hanya jurnal yang sudah diposting, kecuali dicentang).',
  required: ['tanggalSampai'],
  params: [
    { key: 'tanggalDari', label: 'Tanggal Dari', type: 'date', rangeWith: 'tanggalSampai' },
    { key: 'tanggalSampai', label: 'Tanggal Sampai', type: 'date' },
    { key: 'semuaJurnal', label: 'Termasuk jurnal belum posting', type: 'checkbox', defaultValue: false },
  ],
  fields: [
    f('kode', 'Kode'), f('nama', 'Nama Perkiraan'), f('tipe', 'Tipe'),
    f('debit', 'Debit', 'currency'), f('kredit', 'Kredit', 'currency'), f('saldo', 'Saldo (Debit - Kredit)', 'currency'),
  ],
  async run(p, ctx) {
    const journal: any = { Date: dateFilter(p) };
    if (!bool(p, 'semuaJurnal')) journal.IsPosted = true;
    const entries: any[] = await ctx.prisma.journalEntry.findMany({
      where: { Journal: journal },
      include: { Account: { select: { ID: true, Code: true, Name: true, Type: { select: { Name: true } } } } },
      take: MAX_ROWS * 5,
    });
    const map = new Map<number, any>();
    for (const e of entries) {
      const a = e.Account;
      const g = map.get(a.ID) ?? { kode: a.Code, nama: a.Name, tipe: a.Type?.Name ?? '', debit: 0, kredit: 0, saldo: 0 };
      g.debit += n(e.Debit);
      g.kredit += n(e.Credit);
      g.saldo = g.debit - g.kredit;
      map.set(a.ID, g);
    }
    return [...map.values()].sort((a, b) => a.kode.localeCompare(b.kode));
  },
};

export const financeProviders = [cashIn, cashOut, journalList, trialBalance, accountList];
