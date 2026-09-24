import { ReportProvider, MAX_ROWS } from '../report-engine.types';
import { f, n, str, int, ymd, dateFilter, codeRange, dateRangeParams, lookupParam, warehouseParam, paymentStatusParam } from '../helpers';

const params = () => [
  ...dateRangeParams(),
  lookupParam('supplierDari', 'Supplier Dari', 'supplier'),
  lookupParam('supplierSampai', 'Supplier Sampai', 'supplier'),
  warehouseParam(),
  paymentStatusParam(),
];

export function purchaseWhere(p: Record<string, any>) {
  const where: any = { Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } };
  const d = dateFilter(p);
  if (d) where.Date = d;
  const sr = codeRange(p, 'supplierDari', 'supplierSampai');
  if (sr) where.Supplier = { Code: sr };
  const g = int(p, 'gudang');
  if (g) where.WarehouseID = g;
  const st = str(p, 'status');
  if (st) where.PaymentStatus = { Code: st };
  return where;
}

export const purchaseList: ReportProvider = {
  key: 'purchase-list',
  group: 'Pembelian',
  title: 'Laporan Daftar Pembelian',
  description: 'Daftar transaksi pembelian beserta status pembayaran.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: params(),
  fields: [
    f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('supplier', 'Supplier'), f('gudang', 'Gudang'), f('status', 'Status'),
    f('total', 'Total', 'currency'), f('dibayar', 'Dibayar', 'currency'), f('sisa', 'Sisa', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.purchase.findMany({
      where: purchaseWhere(p),
      include: {
        Supplier: { select: { Code: true, Name: true } },
        Warehouse: { select: { Name: true } },
        PaymentStatus: { select: { Name: true } },
        PurchasePayments: { select: { Amount: true } },
      },
      orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => {
      const paid = x.PurchasePayments.reduce((s: number, y: any) => s + n(y.Amount), 0);
      return {
        kode: x.Code, tanggal: ymd(x.Date), supplier: x.Supplier.Name, gudang: x.Warehouse?.Name ?? '',
        status: x.PaymentStatus.Name, total: n(x.Total), dibayar: paid, sisa: Math.max(0, n(x.Total) - paid),
      };
    });
  },
};

export const purchaseDetail: ReportProvider = {
  key: 'purchase-detail',
  group: 'Pembelian',
  title: 'Laporan Detail Pembelian',
  description: 'Rincian pembelian per baris item.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: params(),
  fields: [
    f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('supplier', 'Supplier'), f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'),
    f('qty', 'Qty', 'number'), f('satuan', 'Satuan'), f('harga', 'Harga', 'currency'), f('diskon', 'Diskon', 'currency'), f('subtotal', 'Subtotal', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.purchaseItem.findMany({
      where: { Purchase: purchaseWhere(p) },
      include: {
        Purchase: { select: { Code: true, Date: true, Supplier: { select: { Name: true } } } },
        Product: { select: { Code: true, Name: true } },
        Unit: { select: { Name: true, Abbreviation: true } },
      },
      orderBy: [{ Purchase: { Date: 'asc' } }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => ({
      kode: x.Purchase.Code, tanggal: ymd(x.Purchase.Date), supplier: x.Purchase.Supplier.Name,
      kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: n(x.Quantity),
      satuan: x.Unit?.Abbreviation || x.Unit?.Name || '', harga: n(x.UnitPrice), diskon: n(x.DiscountAmount), subtotal: n(x.Subtotal),
    }));
  },
};

export const purchaseBySupplier: ReportProvider = {
  key: 'purchase-by-supplier',
  group: 'Pembelian',
  title: 'Laporan Pembelian per Supplier',
  description: 'Total pembelian dikelompokkan per supplier.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: params(),
  fields: [
    f('kodesupplier', 'Kode Supplier'), f('supplier', 'Supplier'), f('jmltransaksi', 'Jml Transaksi', 'number'),
    f('total', 'Total', 'currency'), f('dibayar', 'Dibayar', 'currency'), f('sisa', 'Sisa', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.purchase.findMany({
      where: purchaseWhere(p),
      include: { Supplier: { select: { Code: true, Name: true } }, PurchasePayments: { select: { Amount: true } } },
      take: MAX_ROWS,
    });
    const map = new Map<string, any>();
    for (const x of rows) {
      const g = map.get(x.Supplier.Code) ?? { kodesupplier: x.Supplier.Code, supplier: x.Supplier.Name, jmltransaksi: 0, total: 0, dibayar: 0, sisa: 0 };
      const paid = x.PurchasePayments.reduce((s: number, y: any) => s + n(y.Amount), 0);
      g.jmltransaksi += 1;
      g.total += n(x.Total);
      g.dibayar += paid;
      g.sisa += Math.max(0, n(x.Total) - paid);
      map.set(x.Supplier.Code, g);
    }
    return [...map.values()].sort((a, b) => a.kodesupplier.localeCompare(b.kodesupplier));
  },
};


// ─── Retur Pembelian ────────────────────────────────────────
const returnWhere = (p: Record<string, any>) => {
  const where: any = { Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } };
  const d = dateFilter(p);
  if (d) where.Date = d;
  const sr = codeRange(p, 'supplierDari', 'supplierSampai');
  if (sr) where.Supplier = { Code: sr };
  const g = int(p, 'gudang');
  if (g) where.WarehouseID = g;
  return where;
};
const returnParams = () => [
  ...dateRangeParams(),
  lookupParam('supplierDari', 'Supplier Dari', 'supplier'),
  lookupParam('supplierSampai', 'Supplier Sampai', 'supplier'),
  warehouseParam(),
];

export const purchaseReturnReport: ReportProvider = {
  key: 'purchase-return',
  group: 'Pembelian',
  title: 'Laporan Retur Pembelian',
  description: 'Daftar transaksi retur pembelian pada periode.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: returnParams(),
  fields: [
    f('kode', 'Kode Retur'), f('tanggal', 'Tanggal', 'date'), f('kodebeli', 'No Pembelian'), f('supplier', 'Supplier'),
    f('gudang', 'Gudang'), f('alasan', 'Alasan'), f('total', 'Total Retur', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.purchaseReturn.findMany({
      where: returnWhere(p),
      include: { Supplier: { select: { Name: true } }, Purchase: { select: { Code: true } }, Warehouse: { select: { Name: true } } },
      orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => ({
      kode: x.Code, tanggal: ymd(x.Date), kodebeli: x.Purchase?.Code ?? '', supplier: x.Supplier.Name,
      gudang: x.Warehouse?.Name ?? '', alasan: x.Reason ?? '', total: n(x.TotalReturn),
    }));
  },
};

// ─── Pembelian per Item ─────────────────────────────────────
export const purchaseByProduct: ReportProvider = {
  key: 'purchase-by-product',
  group: 'Pembelian',
  title: 'Laporan Pembelian per Item',
  description: 'Qty dan nilai pembelian dikelompokkan per item.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: params(),
  fields: [
    f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('satuan', 'Satuan'), f('jmltransaksi', 'Jml Transaksi', 'number'),
    f('qty', 'Qty', 'number'), f('total', 'Total Pembelian', 'currency'), f('hargarata', 'Harga Rata-rata', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.purchaseItem.findMany({
      where: { Purchase: purchaseWhere(p) },
      include: { Product: { select: { Code: true, Name: true } }, Unit: { select: { Name: true, Abbreviation: true } } },
      take: MAX_ROWS,
    });
    const map = new Map<string, any>();
    for (const x of rows) {
      const g = map.get(x.Product.Code) ?? {
        kodeitem: x.Product.Code, namaitem: x.Product.Name, satuan: x.Unit?.Abbreviation || x.Unit?.Name || '',
        jmltransaksi: 0, qty: 0, total: 0, hargarata: 0,
      };
      g.jmltransaksi += 1;
      g.qty += n(x.Quantity);
      g.total += n(x.Subtotal);
      g.hargarata = g.qty ? g.total / g.qty : 0;
      map.set(x.Product.Code, g);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  },
};

export const purchaseProviders = [purchaseList, purchaseDetail, purchaseBySupplier, purchaseReturnReport, purchaseByProduct];
