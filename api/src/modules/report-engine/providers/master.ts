import { ReportProvider, ReportContext, MAX_ROWS } from '../report-engine.types';
import { f, n, str, int, lookupParam, warehouseParam } from '../helpers';

const itemFilterParams = () => [
  lookupParam('item', 'Item', 'products'),
  { key: 'jenis', label: 'Jenis', type: 'select' as const, source: { endpoint: 'categories', valueField: 'ID', labelField: 'Name' } },
  lookupParam('supel', 'Supel', 'supplier'),
  warehouseParam(),
];

async function loadItems(p: Record<string, any>, ctx: ReportContext) {
  const where: any = {};
  const item = str(p, 'item');
  if (item) where.Code = item;
  const jenis = int(p, 'jenis');
  if (jenis) where.CategoryID = jenis;
  const supel = str(p, 'supel');
  if (supel) where.PurchaseItems = { some: { Purchase: { Supplier: { Code: supel } } } };
  const gudang = int(p, 'gudang');
  const products: any[] = await ctx.prisma.product.findMany({
    where,
    include: {
      Category: { select: { Name: true } },
      Brand: { select: { Name: true } },
      Unit: { select: { Name: true, Abbreviation: true } },
      ProductStocks: gudang ? { where: { WarehouseID: gudang } } : true,
      ShelfProducts: { include: { Shelf: { select: { Code: true, Name: true, WarehouseID: true } } } },
    },
    orderBy: { Code: 'asc' },
    take: MAX_ROWS,
  });
  return products.map((pr) => {
    let stock: number;
    if (gudang) {
      const ps = pr.ProductStocks[0];
      stock = ps ? n(ps.Quantity) : pr.WarehouseID === gudang ? n(pr.Stock) : 0;
    } else if (pr.ProductStocks.length > 0) {
      stock = pr.ProductStocks.reduce((s: number, x: any) => s + n(x.Quantity), 0);
    } else {
      stock = n(pr.Stock);
    }
    const shelves = pr.ShelfProducts
      .filter((sp: any) => !gudang || sp.Shelf.WarehouseID === gudang)
      .map((sp: any) => sp.Shelf.Name)
      .join(', ');
    return { pr, stock, shelves };
  });
}

export const masterItems: ReportProvider = {
  key: 'master-items',
  group: 'Master',
  title: 'Laporan Daftar Item',
  description: 'Daftar item beserta jenis, rak, jumlah stok, satuan dan harga pokok.',
  params: itemFilterParams(),
  fields: [
    f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('jenis', 'Jenis'), f('rak', 'Rak'),
    f('jmlstok', 'Jml Stok', 'number'), f('satuan', 'Satuan'), f('hargapokok', 'Harga Pokok', 'currency'),
  ],
  async run(p, ctx) {
    const items = await loadItems(p, ctx);
    return items.map(({ pr, stock, shelves }) => ({
      kodeitem: pr.Code,
      namaitem: pr.Name,
      jenis: pr.Category?.Name ?? '',
      rak: shelves,
      jmlstok: stock,
      satuan: pr.Unit?.Abbreviation || pr.Unit?.Name || '',
      hargapokok: n(pr.PurchasePrice),
    }));
  },
};

export const masterItemsFull: ReportProvider = {
  key: 'master-items-full',
  group: 'Master',
  title: 'Laporan Daftar Item lengkap',
  description: 'Daftar item lengkap: barcode, merek, harga pokok/jual, stok minimal dan keterangan.',
  params: itemFilterParams(),
  fields: [
    f('kodeitem', 'Kode Item'), f('barcode', 'Barcode'), f('namaitem', 'Nama Item'), f('jenis', 'Jenis'),
    f('merek', 'Merek'), f('rak', 'Rak'), f('jmlstok', 'Jml Stok', 'number'), f('minimalstok', 'Minimal Stok', 'number'),
    f('satuan', 'Satuan'), f('hargapokok', 'Harga Pokok', 'currency'), f('hargajual', 'Harga Jual', 'currency'),
    f('keterangan', 'Keterangan'), f('aktif', 'Aktif'),
  ],
  async run(p, ctx) {
    const items = await loadItems(p, ctx);
    return items.map(({ pr, stock, shelves }) => ({
      kodeitem: pr.Code,
      barcode: pr.Barcode ?? '',
      namaitem: pr.Name,
      jenis: pr.Category?.Name ?? '',
      merek: pr.Brand?.Name ?? '',
      rak: shelves,
      jmlstok: stock,
      minimalstok: n(pr.MinimumStock),
      satuan: pr.Unit?.Abbreviation || pr.Unit?.Name || '',
      hargapokok: n(pr.PurchasePrice),
      hargajual: n(pr.SellingPrice),
      keterangan: pr.Description ?? '',
      aktif: pr.IsActive ? 'Ya' : 'Tidak',
    }));
  },
};

export const masterCustomers: ReportProvider = {
  key: 'master-customers',
  group: 'Master',
  title: 'Laporan Daftar Pelanggan',
  description: 'Daftar pelanggan beserta kontak dan total piutang.',
  params: [lookupParam('customer', 'Pelanggan', 'customer')],
  fields: [
    f('code', 'Kode'), f('name', 'Nama'), f('address', 'Alamat'), f('phone', 'Telepon'), f('email', 'Email'),
    f('piutang', 'Total Piutang', 'currency'), f('keterangan', 'Keterangan'),
  ],
  async run(p, ctx) {
    const code = str(p, 'customer');
    const rows: any[] = await ctx.prisma.customer.findMany({ where: code ? { Code: code } : {}, orderBy: { Code: 'asc' }, take: MAX_ROWS });
    return rows.map((c) => ({
      code: c.Code, name: c.Name, address: c.Address ?? '', phone: c.Phone ?? '', email: c.Email ?? '',
      piutang: n(c.TotalReceivable), keterangan: c.Notes ?? '',
    }));
  },
};

export const masterSuppliers: ReportProvider = {
  key: 'master-suppliers',
  group: 'Master',
  title: 'Laporan Daftar Supplier',
  description: 'Daftar supplier beserta kontak dan total hutang.',
  params: [lookupParam('supplier', 'Supplier', 'supplier')],
  fields: [
    f('code', 'Kode'), f('name', 'Nama'), f('address', 'Alamat'), f('phone', 'Telepon'), f('contact', 'Kontak'),
    f('email', 'Email'), f('hutang', 'Total Hutang', 'currency'), f('keterangan', 'Keterangan'),
  ],
  async run(p, ctx) {
    const code = str(p, 'supplier');
    const rows: any[] = await ctx.prisma.supplier.findMany({ where: code ? { Code: code } : {}, orderBy: { Code: 'asc' }, take: MAX_ROWS });
    return rows.map((s) => ({
      code: s.Code, name: s.Name, address: s.Address ?? '', phone: s.Phone ?? '', contact: s.ContactPerson ?? '',
      email: s.Email ?? '', hutang: n(s.TotalDebt), keterangan: s.Notes ?? '',
    }));
  },
};

export const masterSales: ReportProvider = {
  key: 'master-sales',
  group: 'Master',
  title: 'Laporan Daftar Sales',
  description: 'Daftar tenaga penjual (sales person).',
  params: [],
  fields: [f('code', 'Kode'), f('name', 'Nama'), f('address', 'Alamat'), f('phone', 'Telepon'), f('email', 'Email'), f('aktif', 'Aktif')],
  async run(_p, ctx) {
    const rows: any[] = await ctx.prisma.salesPerson.findMany({ orderBy: { Code: 'asc' }, take: MAX_ROWS });
    return rows.map((s) => ({
      code: s.Code, name: s.Name, address: s.Address ?? '', phone: s.Phone ?? '', email: s.Email ?? '',
      aktif: s.IsActive ? 'Ya' : 'Tidak',
    }));
  },
};

export const masterProviders = [masterItems, masterItemsFull, masterCustomers, masterSuppliers, masterSales];
