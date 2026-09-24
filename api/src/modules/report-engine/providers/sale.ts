import { ReportProvider, MAX_ROWS } from '../report-engine.types';
import { ReportParamDef } from '../report-engine.types';
import { f, n, str, int, ymd, startOf, endOf, todayStr, dateFilter, codeRange, dateRangeParams, lookupParam, warehouseParam, paymentStatusParam } from '../helpers';

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


// ─── Retur Penjualan ────────────────────────────────────────
const returnWhere = (p: Record<string, any>) => {
  const where: any = { Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } };
  const d = dateFilter(p);
  if (d) where.Date = d;
  const cr = codeRange(p, 'customerDari', 'customerSampai');
  if (cr) where.Customer = { Code: cr };
  const g = int(p, 'gudang');
  if (g) where.WarehouseID = g;
  return where;
};
const returnParams = () => [
  ...dateRangeParams(),
  lookupParam('customerDari', 'Pelanggan Dari', 'customer'),
  lookupParam('customerSampai', 'Pelanggan Sampai', 'customer'),
  warehouseParam(),
];

export const saleReturnReport: ReportProvider = {
  key: 'sale-return',
  group: 'Penjualan',
  title: 'Laporan Retur Penjualan',
  description: 'Daftar transaksi retur penjualan pada periode.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: returnParams(),
  fields: [
    f('kode', 'Kode Retur'), f('tanggal', 'Tanggal', 'date'), f('kodejual', 'No Penjualan'), f('pelanggan', 'Pelanggan'),
    f('gudang', 'Gudang'), f('alasan', 'Alasan'), f('total', 'Total Retur', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.saleReturn.findMany({
      where: returnWhere(p),
      include: { Customer: { select: { Name: true } }, Sale: { select: { Code: true } }, Warehouse: { select: { Name: true } } },
      orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => ({
      kode: x.Code, tanggal: ymd(x.Date), kodejual: x.Sale?.Code ?? '', pelanggan: x.Customer.Name,
      gudang: x.Warehouse?.Name ?? '', alasan: x.Reason ?? '', total: n(x.TotalReturn),
    }));
  },
};

export const saleReturnByItem: ReportProvider = {
  key: 'sale-return-by-product',
  group: 'Penjualan',
  title: 'Laporan Retur Penjualan per Item',
  description: 'Qty dan nilai retur penjualan dikelompokkan per item.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: returnParams(),
  fields: [
    f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('satuan', 'Satuan'), f('jmlretur', 'Jml Retur', 'number'),
    f('qty', 'Qty', 'number'), f('nilai', 'Nilai Retur', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.saleReturnItem.findMany({
      where: { SaleReturn: returnWhere(p) },
      include: { Product: { select: { Code: true, Name: true, Unit: { select: { Name: true, Abbreviation: true } } } }, Unit: { select: { Name: true, Abbreviation: true } } },
      take: MAX_ROWS,
    });
    const map = new Map<string, any>();
    for (const x of rows) {
      const u = x.Unit ?? x.Product.Unit;
      const g = map.get(x.Product.Code) ?? { kodeitem: x.Product.Code, namaitem: x.Product.Name, satuan: u?.Abbreviation || u?.Name || '', jmlretur: 0, qty: 0, nilai: 0 };
      g.jmlretur += 1;
      g.qty += n(x.Quantity);
      g.nilai += n(x.Subtotal);
      map.set(x.Product.Code, g);
    }
    return [...map.values()].sort((a, b) => b.nilai - a.nilai);
  },
};

// ─── Penjualan per Supplier / Wilayah ───────────────────────
// Product has no supplier column: the supplier of an item is taken from its most recent purchase.
export const saleBySupplier: ReportProvider = {
  key: 'sale-by-supplier',
  group: 'Penjualan',
  title: 'Laporan Penjualan per Supplier',
  description: 'Penjualan dikelompokkan per supplier. Supplier item ditentukan dari pembelian terakhir item tersebut.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: [
    ...dateRangeParams(),
    lookupParam('supplierDari', 'Supplier Dari', 'supplier'),
    lookupParam('supplierSampai', 'Supplier Sampai', 'supplier'),
    warehouseParam(),
  ],
  fields: [
    f('kodesupplier', 'Kode Supplier'), f('supplier', 'Supplier'), f('jmlitem', 'Jml Item', 'number'),
    f('qty', 'Qty', 'number'), f('omzet', 'Omzet', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.saleItem.findMany({
      where: { Sale: { ...saleWhere({ ...p, status: undefined }), IsReturn: false } },
      include: { Product: { select: { ID: true } } },
      take: MAX_ROWS,
    });
    const ids = [...new Set(rows.map((x) => x.Product.ID as number))];
    const pis: any[] = ids.length
      ? await ctx.prisma.purchaseItem.findMany({
          where: { ProductID: { in: ids }, Purchase: { Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } } },
          select: { ProductID: true, Purchase: { select: { Supplier: { select: { Code: true, Name: true } } } } },
          orderBy: [{ Purchase: { Date: 'desc' } }, { ID: 'desc' }],
        })
      : [];
    const supOf = new Map<number, { Code: string; Name: string }>();
    for (const pi of pis) if (!supOf.has(pi.ProductID)) supOf.set(pi.ProductID, pi.Purchase.Supplier);
    const from = str(p, 'supplierDari');
    const to = str(p, 'supplierSampai');
    const map = new Map<string, any>();
    const seen = new Map<string, Set<number>>();
    for (const x of rows) {
      const sup = supOf.get(x.Product.ID);
      if ((from || to) && !sup) continue;
      if (sup && ((from && sup.Code < from) || (to && sup.Code > to))) continue;
      const k = sup?.Code ?? '';
      const g = map.get(k) ?? { kodesupplier: k, supplier: sup?.Name ?? '(Tanpa Supplier)', jmlitem: 0, qty: 0, omzet: 0 };
      const set = seen.get(k) ?? new Set<number>();
      set.add(x.Product.ID);
      seen.set(k, set);
      g.jmlitem = set.size;
      g.qty += n(x.Quantity);
      g.omzet += n(x.Subtotal);
      map.set(k, g);
    }
    return [...map.values()].sort((a, b) => b.omzet - a.omzet);
  },
};

// Customer has no region column: the wilayah is taken from the last comma-separated part of the customer address.
const wilayahOf = (addr?: string | null): string => {
  const parts = (addr ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '(Tanpa Wilayah)';
};

export const saleByRegion: ReportProvider = {
  key: 'sale-by-region',
  group: 'Penjualan',
  title: 'Laporan Penjualan per Wilayah Pelanggan',
  description: 'Penjualan dikelompokkan per wilayah pelanggan (bagian terakhir alamat pelanggan).',
  required: ['tanggalDari', 'tanggalSampai'],
  params: [
    ...dateRangeParams(),
    lookupParam('customerDari', 'Pelanggan Dari', 'customer'),
    lookupParam('customerSampai', 'Pelanggan Sampai', 'customer'),
    warehouseParam(),
  ],
  fields: [
    f('wilayah', 'Wilayah'), f('jmlpelanggan', 'Jml Pelanggan', 'number'), f('jmltransaksi', 'Jml Transaksi', 'number'), f('total', 'Total', 'currency'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.sale.findMany({
      where: { ...saleWhere({ ...p, status: undefined }), IsReturn: false },
      include: { Customer: { select: { ID: true, Address: true } } },
      take: MAX_ROWS,
    });
    const map = new Map<string, any>();
    const cust = new Map<string, Set<number>>();
    for (const x of rows) {
      const w = wilayahOf(x.Customer.Address);
      const g = map.get(w) ?? { wilayah: w, jmlpelanggan: 0, jmltransaksi: 0, total: 0 };
      const set = cust.get(w) ?? new Set<number>();
      set.add(x.Customer.ID);
      cust.set(w, set);
      g.jmlpelanggan = set.size;
      g.jmltransaksi += 1;
      g.total += n(x.Total);
      map.set(w, g);
    }
    return [...map.values()].sort((a, b) => b.total - a.total);
  },
};

// ─── Pembayaran Kartu Bayar / E-Money ───────────────────────
// Payment methods carry no type flag, so card / e-money methods are recognised by name.
const CARD_WORDS = ['kartu', 'debit', 'kredit', 'credit', 'card', 'edc'];
const EMONEY_WORDS = ['e-money', 'emoney', 'e money', 'ovo', 'gopay', 'dana', 'shopee', 'linkaja', 'qris'];

const paymentReport = (key: string, title: string, description: string, words: string[], methodLabel: string): ReportProvider => ({
  key,
  group: 'Penjualan',
  title,
  description,
  required: ['tanggalDari', 'tanggalSampai'],
  params: [
    ...dateRangeParams(),
    { key: 'metode', label: methodLabel, type: 'select', source: { endpoint: 'payment-methods', valueField: 'ID', labelField: 'Name' } },
    warehouseParam(),
  ],
  fields: [
    f('tanggal', 'Tanggal', 'date'), f('kodejual', 'No Penjualan'), f('pelanggan', 'Pelanggan'), f('metode', 'Metode Bayar'),
    f('referensi', 'No Referensi'), f('jumlah', 'Jumlah', 'currency'),
  ],
  async run(p, ctx) {
    const m = int(p, 'metode');
    const g = int(p, 'gudang');
    const rows: any[] = await ctx.prisma.salePayment.findMany({
      where: {
        Date: dateFilter(p),
        Method: m ? { ID: m } : { OR: words.flatMap((w) => [{ Name: { contains: w, mode: 'insensitive' } }, { Code: { contains: w, mode: 'insensitive' } }]) },
        Sale: { PaymentStatus: { Code: { not: 'CANCELLED' } }, ...(g ? { WarehouseID: g } : {}) },
      },
      include: { Method: { select: { Name: true } }, Sale: { select: { Code: true, Customer: { select: { Name: true } } } } },
      orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => ({
      tanggal: ymd(x.Date), kodejual: x.Sale.Code, pelanggan: x.Sale.Customer.Name, metode: x.Method.Name,
      referensi: x.ReferenceNumber ?? '', jumlah: n(x.Amount),
    }));
  },
});

export const saleCardPayments = paymentReport(
  'sale-payment-card', 'Laporan Pembayaran dengan Kartu Bayar',
  'Rekap pembayaran penjualan dengan kartu bayar (kartu debit / kredit).', CARD_WORDS, 'Kartu Bayar',
);
export const saleEmoneyPayments = paymentReport(
  'sale-payment-emoney', 'Laporan Pembayaran dengan E-Money',
  'Rekap pembayaran penjualan dengan E-Money.', EMONEY_WORDS, 'Penyedia E-Money',
);

// ─── Point Pelanggan ────────────────────────────────────────
export const customerPoints: ReportProvider = {
  key: 'customer-points',
  group: 'Penjualan',
  title: 'Laporan Point Pelanggan',
  description: 'Saldo point pelanggan, total belanja dan point yang ditukar pada periode.',
  params: [
    ...dateRangeParams(),
    lookupParam('customerDari', 'Pelanggan Dari', 'customer'),
    lookupParam('customerSampai', 'Pelanggan Sampai', 'customer'),
  ],
  fields: [
    f('kode', 'Kode Pelanggan'), f('pelanggan', 'Pelanggan'), f('grup', 'Grup'), f('jmltransaksi', 'Jml Transaksi', 'number'),
    f('belanja', 'Total Belanja', 'currency'), f('poinditukar', 'Point Ditukar', 'number'), f('saldo', 'Saldo Point', 'number'),
  ],
  async run(p, ctx) {
    const cr = codeRange(p, 'customerDari', 'customerSampai');
    const d = dateFilter(p);
    const customers: any[] = await ctx.prisma.customer.findMany({
      where: cr ? { Code: cr } : {},
      select: { ID: true, Code: true, Name: true, PointBalance: true, CustomerGroup: { select: { Name: true } } },
      orderBy: { Code: 'asc' },
      take: MAX_ROWS,
    });
    const ids = customers.map((c) => c.ID);
    const [sales, reds]: any[][] = await Promise.all([
      ctx.prisma.sale.findMany({
        where: { CustomerID: { in: ids }, IsReturn: false, PaymentStatus: { Code: { not: 'CANCELLED' } }, ...(d ? { Date: d } : {}) },
        select: { CustomerID: true, Total: true },
      }),
      ctx.prisma.pointRedemption.findMany({ where: { CustomerID: { in: ids }, ...(d ? { Date: d } : {}) }, select: { CustomerID: true, PointsRedeemed: true } }),
    ]);
    const agg = new Map<number, { jml: number; belanja: number; tukar: number }>();
    const get = (id: number) => agg.get(id) ?? { jml: 0, belanja: 0, tukar: 0 };
    for (const s of sales) { const a = get(s.CustomerID); a.jml += 1; a.belanja += n(s.Total); agg.set(s.CustomerID, a); }
    for (const r of reds) { const a = get(r.CustomerID); a.tukar += n(r.PointsRedeemed); agg.set(r.CustomerID, a); }
    return customers
      .filter((c) => c.PointBalance !== 0 || agg.has(c.ID))
      .map((c) => {
        const a = get(c.ID);
        return { kode: c.Code, pelanggan: c.Name, grup: c.CustomerGroup?.Name ?? '', jmltransaksi: a.jml, belanja: a.belanja, poinditukar: a.tukar, saldo: n(c.PointBalance) };
      });
  },
};

// ─── Grafik ─────────────────────────────────────────────────
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const monthOptions = () => MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));
const nowYear = () => Number(todayStr().slice(0, 4));
const nowMonth = () => Number(todayStr().slice(5, 7));
const pad2 = (v: number) => String(v).padStart(2, '0');

const monthParams = (): ReportParamDef[] => [
  { key: 'bulan', label: 'Bulan', type: 'select', options: monthOptions(), defaultValue: String(nowMonth()) },
  { key: 'tahun', label: 'Tahun', type: 'text', defaultValue: String(nowYear()) },
  warehouseParam(),
];
const yearParams = (): ReportParamDef[] => [
  { key: 'tahun', label: 'Tahun', type: 'text', defaultValue: String(nowYear()) },
  warehouseParam(),
];

const netSaleWhere = (p: Record<string, any>, gte: Date, lte: Date) => {
  const g = int(p, 'gudang');
  return { IsReturn: false, PaymentStatus: { Code: { not: 'CANCELLED' } }, Date: { gte, lte }, ...(g ? { WarehouseID: g } : {}) };
};

const topN = (p: Record<string, any>) => Math.max(1, Math.min(100, int(p, 'jumlah') ?? 10));

export const chartBestItems: ReportProvider = {
  key: 'chart-sale-best-items',
  group: 'Penjualan',
  title: 'Grafik Penjualan Item Terbaik',
  description: 'Item dengan penjualan (qty) terbanyak pada periode.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: [
    ...dateRangeParams(),
    warehouseParam(),
    { key: 'jenis', label: 'Jenis', type: 'select', source: { endpoint: 'categories', valueField: 'ID', labelField: 'Name' } },
    { key: 'jumlah', label: 'Jumlah Item', type: 'text', defaultValue: '10' },
  ],
  fields: [f('peringkat', 'No', 'number'), f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('qty', 'Qty', 'number'), f('omzet', 'Omzet', 'currency')],
  chart: { type: 'bar', labelField: 'namaitem', valueFields: [{ key: 'qty', label: 'Qty' }] },
  async run(p, ctx) {
    const jenis = int(p, 'jenis');
    const rows: any[] = await ctx.prisma.saleItem.findMany({
      where: { Sale: { ...saleWhere({ ...p, status: undefined }), IsReturn: false }, ...(jenis ? { Product: { CategoryID: jenis } } : {}) },
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
    return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, topN(p)).map((r, i) => ({ peringkat: i + 1, ...r }));
  },
};

export const chartDaily: ReportProvider = {
  key: 'chart-sale-daily',
  group: 'Penjualan',
  title: 'Grafik Penjualan Harian',
  description: 'Omzet penjualan per hari dalam satu bulan.',
  required: ['bulan', 'tahun'],
  params: monthParams(),
  fields: [f('tanggal', 'Tanggal', 'date'), f('jmltransaksi', 'Jml Transaksi', 'number'), f('omzet', 'Omzet', 'currency')],
  chart: { type: 'line', labelField: 'tanggal', valueFields: [{ key: 'omzet', label: 'Omzet' }] },
  async run(p, ctx) {
    const y = int(p, 'tahun') ?? nowYear();
    const m = int(p, 'bulan') ?? nowMonth();
    const days = new Date(y, m, 0).getDate();
    const gte = startOf(`${y}-${pad2(m)}-01`)!;
    const lte = endOf(`${y}-${pad2(m)}-${pad2(days)}`)!;
    const sales: any[] = await ctx.prisma.sale.findMany({ where: netSaleWhere(p, gte, lte), select: { Date: true, Total: true } });
    const out = Array.from({ length: days }, (_, i) => ({ tanggal: `${y}-${pad2(m)}-${pad2(i + 1)}`, jmltransaksi: 0, omzet: 0 }));
    for (const s of sales) {
      const day = Number(ymd(s.Date).slice(8, 10));
      if (out[day - 1]) { out[day - 1].jmltransaksi += 1; out[day - 1].omzet += n(s.Total); }
    }
    return out;
  },
};

export const chartMonthly: ReportProvider = {
  key: 'chart-sale-monthly',
  group: 'Penjualan',
  title: 'Grafik Penjualan Bulanan',
  description: 'Omzet penjualan per bulan dalam satu tahun.',
  required: ['tahun'],
  params: yearParams(),
  fields: [f('bulan', 'Bulan'), f('jmltransaksi', 'Jml Transaksi', 'number'), f('omzet', 'Omzet', 'currency')],
  chart: { type: 'bar', labelField: 'bulan', valueFields: [{ key: 'omzet', label: 'Omzet' }] },
  async run(p, ctx) {
    const y = int(p, 'tahun') ?? nowYear();
    const sales: any[] = await ctx.prisma.sale.findMany({ where: netSaleWhere(p, startOf(`${y}-01-01`)!, endOf(`${y}-12-31`)!), select: { Date: true, Total: true } });
    const out = MONTHS.map((bulan) => ({ bulan, jmltransaksi: 0, omzet: 0 }));
    for (const s of sales) {
      const mi = Number(ymd(s.Date).slice(5, 7)) - 1;
      out[mi].jmltransaksi += 1;
      out[mi].omzet += n(s.Total);
    }
    return out;
  },
};

export const chartCustomerVisits: ReportProvider = {
  key: 'chart-customer-visits',
  group: 'Penjualan',
  title: 'Grafik Kedatangan Pelanggan',
  description: 'Jumlah transaksi dan pelanggan berbeda yang datang per hari dalam satu bulan.',
  required: ['bulan', 'tahun'],
  params: monthParams(),
  fields: [f('tanggal', 'Tanggal', 'date'), f('jmltransaksi', 'Jml Transaksi', 'number'), f('jmlpelanggan', 'Jml Pelanggan', 'number')],
  chart: { type: 'bar', labelField: 'tanggal', valueFields: [{ key: 'jmltransaksi', label: 'Transaksi' }, { key: 'jmlpelanggan', label: 'Pelanggan' }] },
  async run(p, ctx) {
    const y = int(p, 'tahun') ?? nowYear();
    const m = int(p, 'bulan') ?? nowMonth();
    const days = new Date(y, m, 0).getDate();
    const sales: any[] = await ctx.prisma.sale.findMany({
      where: netSaleWhere(p, startOf(`${y}-${pad2(m)}-01`)!, endOf(`${y}-${pad2(m)}-${pad2(days)}`)!),
      select: { Date: true, CustomerID: true },
    });
    const out = Array.from({ length: days }, (_, i) => ({ tanggal: `${y}-${pad2(m)}-${pad2(i + 1)}`, jmltransaksi: 0, jmlpelanggan: 0 }));
    const sets: Set<number>[] = out.map(() => new Set<number>());
    for (const s of sales) {
      const day = Number(ymd(s.Date).slice(8, 10));
      if (!out[day - 1]) continue;
      out[day - 1].jmltransaksi += 1;
      sets[day - 1].add(s.CustomerID);
      out[day - 1].jmlpelanggan = sets[day - 1].size;
    }
    return out;
  },
};

// ─── Laba/Jual: detail & grafik ─────────────────────────────
export const profitDetail: ReportProvider = {
  key: 'profit-detail',
  group: 'Laba/Jual',
  title: 'Analisa Laba Jual Detail',
  description: 'Laba per baris item penjualan. Sumber harga pokok: harga beli item saat ini (transaksi tidak menyimpan snapshot HPP).',
  required: ['tanggalDari', 'tanggalSampai'],
  params: profitParams(),
  fields: [
    f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('pelanggan', 'Pelanggan'), f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'),
    f('qty', 'Qty', 'number'), f('harga', 'Harga Jual', 'currency'), f('subtotal', 'Penjualan', 'currency'),
    f('hargapokok', 'Harga Pokok', 'currency'), f('hpp', 'HPP', 'currency'), f('laba', 'Laba', 'currency'), f('sumber', 'Sumber HPP'),
  ],
  async run(p, ctx) {
    const rows: any[] = await ctx.prisma.saleItem.findMany({
      where: { Sale: { ...saleWhere(p), IsReturn: false } },
      include: {
        Sale: { select: { Code: true, Date: true, Customer: { select: { Name: true } } } },
        Product: { select: { Code: true, Name: true, PurchasePrice: true } },
      },
      orderBy: [{ Sale: { Date: 'asc' } }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => {
      const hp = n(x.Product.PurchasePrice);
      const hpp = n(x.Quantity) * hp;
      return {
        kode: x.Sale.Code, tanggal: ymd(x.Sale.Date), pelanggan: x.Sale.Customer.Name, kodeitem: x.Product.Code, namaitem: x.Product.Name,
        qty: n(x.Quantity), harga: n(x.UnitPrice), subtotal: n(x.Subtotal), hargapokok: hp, hpp, laba: n(x.Subtotal) - hpp,
        sumber: 'Harga beli item saat ini',
      };
    });
  },
};

export const profitItemChart: ReportProvider = {
  ...profitSalesItem,
  key: 'chart-profit-item',
  title: 'Grafik Laba Jual per Item',
  description: 'Laba penjualan per item (HPP berdasarkan harga beli item saat ini), diurutkan dari laba terbesar.',
  params: [
    ...profitSalesItem.params.filter((x) => x.key !== 'customerDari' && x.key !== 'customerSampai'),
    { key: 'jumlah', label: 'Jumlah Item', type: 'text', defaultValue: '10' },
  ],
  chart: { type: 'bar', labelField: 'namaitem', valueFields: [{ key: 'laba', label: 'Laba' }] },
  async run(p, ctx) {
    const all = await profitSalesItem.run(p, ctx);
    return all.slice(0, topN(p));
  },
};

export const saleProviders = [
  saleList, saleDetail, saleByProduct, saleByCustomer,
  saleReturnReport, saleReturnByItem, saleBySupplier, saleByRegion, saleCardPayments, saleEmoneyPayments, customerPoints,
  chartBestItems, chartDaily, chartMonthly, chartCustomerVisits,
];
export const profitProviders = [profitSales, profitSalesItem, profitDetail, profitItemChart];
