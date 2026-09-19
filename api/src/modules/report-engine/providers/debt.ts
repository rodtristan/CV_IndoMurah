import { ReportProvider, ReportParamDef, MAX_ROWS } from '../report-engine.types';
import { f, n, str, int, ymd, startOf, endOf, codeRange, lookupParam, warehouseParam, todayStr, daysBetween } from '../helpers';

const OPEN_STATUSES = ['PENDING', 'PARTIAL', 'OVERDUE'];

function commonParams(kind: 'supplier' | 'customer'): ReportParamDef[] {
  const isSup = kind === 'supplier';
  return [
    { key: 'tanggalSampai', label: 'Tanggal Sampai', type: 'date', defaultValue: todayStr() },
    { key: 'tanggalDari', label: 'Tanggal Dari', type: 'date', rangeWith: 'tanggalSampai' },
    lookupParam('supplierDari'.replace('supplier', kind), `${isSup ? 'Supplier' : 'Pelanggan'} Dari`, kind),
    lookupParam('supplierSampai'.replace('supplier', kind), `${isSup ? 'Supplier' : 'Pelanggan'} Sampai`, kind),
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
    warehouseParam(),
  ];
}

const fields = (who: string) => [
  f('kodepihak', `Kode ${who}`), f('pihak', who), f('kode', 'Kode Transaksi'), f('tanggal', 'Tanggal', 'date'),
  f('jatuhtempo', 'Jatuh Tempo', 'date'), f('total', 'Total', 'currency'), f('dibayar', 'Dibayar', 'currency'),
  f('sisa', 'Sisa', 'currency'), f('umur', 'Umur (hari)', 'number'),
];

const variants = (label: string) => [
  { key: 'outstanding', title: `Laporan ${label} Beredar` },
  { key: 'overdue', title: `Laporan ${label} Beredar Sudah Jatuh Tempo` },
];

function build(kind: 'supplier' | 'customer') {
  const isSup = kind === 'supplier';
  const dari = `${kind}Dari`;
  const sampai = `${kind}Sampai`;
  return async (p: Record<string, any>, ctx: any) => {
    // The UI only sends tanggalDari when the "Ganti ke range tanggal" toggle is on.
    const asOf = endOf(str(p, 'tanggalSampai') ?? todayStr())!;
    const from = startOf(str(p, 'tanggalDari'));
    const modul = str(p, 'modul');
    if (modul && modul !== 'transaksi') return [];
    const g = int(p, 'gudang');
    const range = codeRange(p, dari, sampai);

    const where: any = {
      Date: { lte: asOf, ...(from ? { gte: from } : {}) },
      PaymentStatus: { Code: { in: OPEN_STATUSES } },
      ...(g ? { WarehouseID: g } : {}),
      ...(range ? { [isSup ? 'Supplier' : 'Customer']: { Code: range } } : {}),
    };
    if (isSup) where.Status = { Code: { notIn: ['CANCELLED', 'REJECTED'] } };
    const rows: any[] = await (isSup ? ctx.prisma.purchase : ctx.prisma.sale).findMany({
      where,
      include: {
        [isSup ? 'Supplier' : 'Customer']: { select: { Code: true, Name: true } },
        [isSup ? 'PurchasePayments' : 'SalePayments']: { select: { Amount: true, Date: true } },
      },
      orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    const out: any[] = [];
    for (const x of rows) {
      const party = isSup ? x.Supplier : x.Customer;
      const payments: any[] = isSup ? x.PurchasePayments : x.SalePayments;
      const paid = payments.filter((y) => y.Date <= asOf).reduce((s, y) => s + n(y.Amount), 0);
      const total = n(x.Total);
      const sisa = total - paid;
      if (sisa <= 0.005) continue;
      // Sales carry no due date: the sale date is treated as the due date.
      const due: Date = (isSup ? x.DueDate : null) ?? x.Date;
      out.push({
        kodepihak: party.Code, pihak: party.Name, kode: x.Code, tanggal: ymd(x.Date), jatuhtempo: ymd(due),
        total, dibayar: paid, sisa, umur: Math.max(0, daysBetween(x.Date, asOf)),
        _due: due,
      });
    }
    return out;
  };
}

function provider(kind: 'supplier' | 'customer'): ReportProvider {
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
      const asOf = endOf(str(p, 'tanggalSampai') ?? todayStr())!;
      const filtered = ctx.variant === 'overdue' ? rows.filter((r) => ymd(r._due) < ymd(asOf)) : rows;
      return filtered.map(({ _due, ...r }) => r);
    },
  };
}

export const debtOutstanding = provider('supplier');
export const receivableOutstanding = provider('customer');
export const debtProviders = [debtOutstanding];
export const receivableProviders = [receivableOutstanding];
