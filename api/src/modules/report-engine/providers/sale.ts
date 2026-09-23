import { ReportProvider, MAX_ROWS } from '../report-engine.types';
import { f, n, str, int, ymd, dateFilter, codeRange, dateRangeParams, lookupParam, warehouseParam, paymentStatusParam } from '../helpers';

const params = () => [
  ...dateRangeParams(),
  lookupParam('customerDari', 'Pelanggan Dari', 'customer'),
  lookupParam('customerSampai', 'Pelanggan Sampai', 'customer'),
  warehouseParam(),
  paymentStatusParam(),
];

export function saleWhere(p: Record<string, any>) {
  const where: any = { PaymentStatus: { Code: { not: 'CANCELLED' } } };
  const st = str(p, 'status');
  if (st) where.PaymentStatus = { Code: st };
  const d = dateFilter(p);
  if (d) where.Date = d;
  const cr = codeRange(p, 'customerDari', 'customerSampai');
  if (cr) where.Customer = { Code: cr };
  const g = int(p, 'gudang');
  if (g) where.WarehouseID = g;
  return where;
}

const paidOf = (x: any) => x.SalePayments.reduce((s: number, y: any) => s + n(y.Amount), 0);

export const saleList: ReportProvider = {
  key: 'sale-list',
  group: 'Penjualan',
  title: 'Laporan Daftar Penjualan',
  description: 'Daftar transaksi penjualan beserta status pembayaran.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: params(),
  fields: [
    f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('pelanggan', 'Pelanggan'), f('sales', 'Sales'), f('gudang', 'Gudang'), f('status', 'Status'),
    f('total', 'Total', 'currency'), f('dibayar', 'Dibayar', 'currency'), f('sisa', 'Sisa', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.sale.findMany({
      where: saleWhere(p),
      include: {
        Customer: { select: { Name: true } }, SalesPerson: { select: { Name: true } }, Warehouse: { select: { Name: true } },
        PaymentStatus: { select: { Name: true } }, SalePayments: { select: { Amount: true } },
      },
      orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => {
      const paid = paidOf(x);
      return {
        kode: x.Code, tanggal: ymd(x.Date), pelanggan: x.Customer.Name, sales: x.SalesPerson?.Name ?? '', gudang: x.Warehouse?.Name ?? '',
        status: x.PaymentStatus.Name, total: n(x.Total), dibayar: paid, sisa: Math.max(0, n(x.Total) - paid),
      };
    });
  },
};

export const saleDetail: ReportProvider = {
  key: 'sale-detail',
  group: 'Penjualan',
  title: 'Laporan Detail Penjualan',
  description: 'Rincian penjualan per baris item.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: params(),
  fields: [
    f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('pelanggan', 'Pelanggan'), f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'),
    f('qty', 'Qty', 'number'), f('satuan', 'Satuan'), f('harga', 'Harga', 'currency'), f('diskon', 'Diskon', 'currency'), f('subtotal', 'Subtotal', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.saleItem.findMany({
      where: { Sale: saleWhere(p) },
      include: {
        Sale: { select: { Code: true, Date: true, Customer: { select: { Name: true } } } },
        Product: { select: { Code: true, Name: true, Unit: { select: { Name: true, Abbreviation: true } } } },
        Unit: { select: { Name: true, Abbreviation: true } },
      },
      orderBy: [{ Sale: { Date: 'asc' } }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => {
      const u = x.Unit ?? x.Product.Unit;
      return {
        kode: x.Sale.Code, tanggal: ymd(x.Sale.Date), pelanggan: x.Sale.Customer.Name, kodeitem: x.Product.Code, namaitem: x.Product.Name,
        qty: n(x.Quantity), satuan: u?.Abbreviation || u?.Name || '', harga: n(x.UnitPrice), diskon: n(x.DiscountAmount), subtotal: n(x.Subtotal),
      };
    });
  },
};

export const saleByProduct: ReportProvider = {
  key: 'sale-by-product',
  group: 'Penjualan',
  title: 'Laporan Penjualan per Item',
  description: 'Qty dan omzet penjualan dikelompokkan per item.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: params(),
  fields: [f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('qty', 'Qty', 'number'), f('omzet', 'Omzet', 'currency')],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.saleItem.findMany({
      where: { Sale: saleWhere(p) },
      include: { Product: { select: { Code: true, Name: true } } },
      take: MAX_ROWS,
    });
    const map = new Map<string, any>();
    for (const x of rows) {
      const g = map.get(x.Product.Code) ?? { kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: 0, omzet: 0 };
      g.qty += n(x.Quantity);
      g.omzet += n(x.Subtotal);
      map.set(x.Product.Code, g);
    }
    return [...map.values()].sort((a, b) => b.omzet - a.omzet);
  },
};

export const saleByCustomer: ReportProvider = {
  key: 'sale-by-customer',
  group: 'Penjualan',
  title: 'Laporan Penjualan per Pelanggan',
  description: 'Total penjualan dikelompokkan per pelanggan.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: params(),
  fields: [
    f('kodepelanggan', 'Kode Pelanggan'), f('pelanggan', 'Pelanggan'), f('jmltransaksi', 'Jml Transaksi', 'number'),
    f('total', 'Total', 'currency'), f('dibayar', 'Dibayar', 'currency'), f('sisa', 'Sisa', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.sale.findMany({
      where: saleWhere(p),
      include: { Customer: { select: { Code: true, Name: true } }, SalePayments: { select: { Amount: true } } },
      take: MAX_ROWS,
    });
    const map = new Map<string, any>();
    for (const x of rows) {
      const g = map.get(x.Customer.Code) ?? { kodepelanggan: x.Customer.Code, pelanggan: x.Customer.Name, jmltransaksi: 0, total: 0, dibayar: 0, sisa: 0 };
      const paid = paidOf(x);
      g.jmltransaksi += 1;
      g.total += n(x.Total);
      g.dibayar += paid;
      g.sisa += Math.max(0, n(x.Total) - paid);
      map.set(x.Customer.Code, g);
    }
    return [...map.values()].sort((a, b) => a.kodepelanggan.localeCompare(b.kodepelanggan));
  },
};

// ─── Laba/Jual ──────────────────────────────────────────────
// HPP uses Product.PurchasePrice (current cost): SaleItem stores no cost snapshot.
const profitParams = () => [
  ...dateRangeParams(),
  lookupParam('customerDari', 'Pelanggan Dari', 'customer'),
  lookupParam('customerSampai', 'Pelanggan Sampai', 'customer'),
  warehouseParam(),
];

export const profitSales: ReportProvider = {
  key: 'profit-sales',
  group: 'Laba/Jual',
  title: 'Laporan Laba Penjualan per Transaksi',
  description: 'Omzet, HPP (berdasarkan harga beli item saat ini) dan laba per transaksi penjualan.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: profitParams(),
  fields: [
    f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('pelanggan', 'Pelanggan'),
    f('omzet', 'Omzet', 'currency'), f('hpp', 'HPP', 'currency'), f('laba', 'Laba', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.sale.findMany({
      where: { ...saleWhere(p), IsReturn: false },
      include: { Customer: { select: { Name: true } }, SaleItems: { include: { Product: { select: { PurchasePrice: true } } } } },
      orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => {
      const omzet = n(x.Subtotal) - n(x.DiscountAmount);
      const hpp = x.SaleItems.reduce((s: number, i: any) => s + n(i.Quantity) * n(i.Product.PurchasePrice), 0);
      return { kode: x.Code, tanggal: ymd(x.Date), pelanggan: x.Customer.Name, omzet, hpp, laba: omzet - hpp };
    });
  },
};

export const profitSalesItem: ReportProvider = {
  key: 'profit-sales-item',
  group: 'Laba/Jual',
  title: 'Laporan Laba Penjualan per Item',
  description: 'Omzet, HPP (berdasarkan harga beli item saat ini) dan laba per item.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: profitParams(),
  fields: [
    f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('qty', 'Qty', 'number'),
    f('omzet', 'Omzet', 'currency'), f('hpp', 'HPP', 'currency'), f('laba', 'Laba', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.saleItem.findMany({
      where: { Sale: { ...saleWhere(p), IsReturn: false } },
      include: { Product: { select: { Code: true, Name: true, PurchasePrice: true } } },
      take: MAX_ROWS,
    });
    const map = new Map<string, any>();
    for (const x of rows) {
      const g = map.get(x.Product.Code) ?? { kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: 0, omzet: 0, hpp: 0, laba: 0 };
      g.qty += n(x.Quantity);
      g.omzet += n(x.Subtotal);
      g.hpp += n(x.Quantity) * n(x.Product.PurchasePrice);
      g.laba = g.omzet - g.hpp;
      map.set(x.Product.Code, g);
    }
    return [...map.values()].sort((a, b) => b.laba - a.laba);
  },
};

export const saleProviders = [saleList, saleDetail, saleByProduct, saleByCustomer];
export const profitProviders = [profitSales, profitSalesItem];
