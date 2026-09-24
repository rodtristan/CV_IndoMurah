import { ReportProvider, MAX_ROWS } from '../report-engine.types';
import { f, n, str, int, ymd, dateFilter, dateRangeParams, lookupParam, warehouseParam } from '../helpers';

const unitName = (u: any) => u?.Abbreviation || u?.Name || '';

export const stockList: ReportProvider = {
  key: 'stock-list',
  group: 'Persediaan',
  title: 'Laporan Stok Barang',
  description: 'Stok per item per gudang beserta nilai persediaan (harga pokok).',
  params: [
    lookupParam('item', 'Item', 'products'),
    { key: 'jenis', label: 'Jenis', type: 'select', source: { endpoint: 'categories', valueField: 'ID', labelField: 'Name' } },
    warehouseParam(),
    { key: 'hanyaStok', label: 'Hanya stok > 0', type: 'checkbox', defaultValue: false },
  ],
  fields: [
    f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('jenis', 'Jenis'), f('gudang', 'Gudang'),
    f('stok', 'Stok', 'number'), f('minimal', 'Stok Minimal', 'number'), f('satuan', 'Satuan'),
    f('hargapokok', 'Harga Pokok', 'currency'), f('nilai', 'Nilai Persediaan', 'currency'),
  ],
  async run(p, ctx) {
    const where: any = {};
    const item = str(p, 'item');
    if (item) where.Code = item;
    const jenis = int(p, 'jenis');
    if (jenis) where.CategoryID = jenis;
    const g = int(p, 'gudang');
    const onlyStock = p?.hanyaStok === true || p?.hanyaStok === 'true';
    const products: any[] = await ctx.prisma.product.findMany({
      where,
      include: {
        Category: { select: { Name: true } },
        Unit: { select: { Name: true, Abbreviation: true } },
        Warehouse: { select: { ID: true, Name: true } },
        ProductStocks: { include: { Warehouse: { select: { Name: true } } } },
      },
      orderBy: { Code: 'asc' },
      take: MAX_ROWS,
    });
    const out: any[] = [];
    for (const pr of products) {
      // Per-warehouse rows when ProductStock exists; otherwise fall back to the product's own stock/warehouse.
      const parts: { gudang: string; wid: number | null; qty: number; min: number }[] =
        pr.ProductStocks.length > 0
          ? pr.ProductStocks.map((s: any) => ({ gudang: s.Warehouse.Name, wid: s.WarehouseID, qty: n(s.Quantity), min: n(s.MinimumStock) }))
          : [{ gudang: pr.Warehouse?.Name ?? '', wid: pr.WarehouseID ?? null, qty: n(pr.Stock), min: n(pr.MinimumStock) }];
      for (const s of parts) {
        if (g && s.wid !== g) continue;
        if (onlyStock && s.qty <= 0) continue;
        out.push({
          kodeitem: pr.Code, namaitem: pr.Name, jenis: pr.Category?.Name ?? '', gudang: s.gudang, stok: s.qty, minimal: s.min,
          satuan: unitName(pr.Unit), hargapokok: n(pr.PurchasePrice), nilai: s.qty * n(pr.PurchasePrice),
        });
      }
    }
    return out;
  },
};

export const stockMutation: ReportProvider = {
  key: 'stock-mutation',
  group: 'Persediaan',
  title: 'Laporan Mutasi Stok',
  description: 'Pergerakan barang masuk (pembelian, stok masuk) dan keluar (penjualan, stok keluar) per item pada periode.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: [...dateRangeParams(), lookupParam('item', 'Item', 'products'), warehouseParam()],
  fields: [
    f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('satuan', 'Satuan'),
    f('pembelian', 'Pembelian', 'number'), f('stokmasuk', 'Stok Masuk', 'number'), f('totalmasuk', 'Total Masuk', 'number'),
    f('penjualan', 'Penjualan', 'number'), f('stokkeluar', 'Stok Keluar', 'number'), f('totalkeluar', 'Total Keluar', 'number'),
    f('stokakhir', 'Stok Saat Ini', 'number'),
  ],
  async run(p, ctx) {
    const d = dateFilter(p);
    const g = int(p, 'gudang');
    const item = str(p, 'item');
    const wh = g ? { WarehouseID: g } : {};
    const pw = item ? { Product: { Code: item } } : {};
    const sel = { Product: { select: { ID: true, Code: true, Name: true, Stock: true, Unit: { select: { Name: true, Abbreviation: true } } } } };
    const [pi, si, sti, sto]: any[][] = await Promise.all([
      ctx.prisma.purchaseItem.findMany({ where: { ...pw, Purchase: { ...wh, Date: d, Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } } }, include: sel, take: MAX_ROWS }),
      ctx.prisma.saleItem.findMany({ where: { ...pw, Sale: { ...wh, Date: d, IsReturn: false, PaymentStatus: { Code: { not: 'CANCELLED' } } } }, include: sel, take: MAX_ROWS }),
      ctx.prisma.stockInItem.findMany({ where: { ...pw, StockIn: { ...wh, Date: d } }, include: sel, take: MAX_ROWS }),
      ctx.prisma.stockOutItem.findMany({ where: { ...pw, StockOut: { ...wh, Date: d } }, include: sel, take: MAX_ROWS }),
    ]);
    const map = new Map<number, any>();
    const add = (list: any[], field: string) => {
      for (const x of list) {
        const pr = x.Product;
        const g0 = map.get(pr.ID) ?? {
          kodeitem: pr.Code, namaitem: pr.Name, satuan: unitName(pr.Unit), pembelian: 0, stokmasuk: 0, totalmasuk: 0,
          penjualan: 0, stokkeluar: 0, totalkeluar: 0, stokakhir: n(pr.Stock),
        };
        g0[field] += n(x.Quantity);
        map.set(pr.ID, g0);
      }
    };
    add(pi, 'pembelian'); add(sti, 'stokmasuk'); add(si, 'penjualan'); add(sto, 'stokkeluar');
    const rows = [...map.values()];
    for (const r of rows) {
      r.totalmasuk = r.pembelian + r.stokmasuk;
      r.totalkeluar = r.penjualan + r.stokkeluar;
    }
    return rows.sort((a, b) => a.kodeitem.localeCompare(b.kodeitem));
  },
};

export const stockOpnameReport: ReportProvider = {
  key: 'stock-opname',
  group: 'Persediaan',
  title: 'Laporan Stok Opname',
  description: 'Hasil stok opname per item: stok sistem, stok hitung dan selisih.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: [...dateRangeParams(), warehouseParam()],
  fields: [
    f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('gudang', 'Gudang'), f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'),
    f('satuan', 'Satuan'), f('stoksistem', 'Stok Sistem', 'number'), f('stokhitung', 'Stok Hitung', 'number'),
    f('selisih', 'Selisih', 'number'), f('nilaiselisih', 'Nilai Selisih', 'currency'), f('catatan', 'Catatan'),
  ],
  async run(p, ctx) {
    const g = int(p, 'gudang');
    const rows: any[] = await ctx.prisma.stockOpnameItem.findMany({
      where: { StockOpname: { Date: dateFilter(p), ...(g ? { WarehouseID: g } : {}) } },
      include: {
        StockOpname: { select: { Code: true, Date: true, Warehouse: { select: { Name: true } } } },
        Product: { select: { Code: true, Name: true } },
        Unit: { select: { Name: true, Abbreviation: true } },
      },
      orderBy: [{ StockOpname: { Date: 'asc' } }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => ({
      kode: x.StockOpname.Code, tanggal: ymd(x.StockOpname.Date), gudang: x.StockOpname.Warehouse.Name,
      kodeitem: x.Product.Code, namaitem: x.Product.Name, satuan: unitName(x.Unit),
      stoksistem: n(x.SystemStock), stokhitung: n(x.CountedStock), selisih: n(x.Difference),
      nilaiselisih: n(x.Difference) * n(x.UnitPrice), catatan: x.Note ?? '',
    }));
  },
};


// ─── Item Masuk / Keluar / Transfer ─────────────────────────
const okStatus = { Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } };
const unitSel = { select: { Name: true, Abbreviation: true } };

export const itemInReport: ReportProvider = {
  key: 'item-in',
  group: 'Persediaan',
  title: 'Laporan Item Masuk',
  description: 'Rincian item yang masuk melalui transaksi stok masuk.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: [...dateRangeParams(), lookupParam('item', 'Item', 'products'), warehouseParam()],
  fields: [
    f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('gudang', 'Gudang'), f('supplier', 'Supplier'),
    f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('qty', 'Qty', 'number'), f('satuan', 'Satuan'),
    f('harga', 'Harga', 'currency'), f('subtotal', 'Subtotal', 'currency'),
  ],
  async run(p, ctx) {
    const g = int(p, 'gudang');
    const item = str(p, 'item');
    const rows: any[] = await ctx.prisma.stockInItem.findMany({
      where: { ...(item ? { Product: { Code: item } } : {}), StockIn: { Date: dateFilter(p), ...okStatus, ...(g ? { WarehouseID: g } : {}) } },
      include: {
        StockIn: { select: { Code: true, Date: true, Warehouse: { select: { Name: true } }, Supplier: { select: { Name: true } } } },
        Product: { select: { Code: true, Name: true } },
        Unit: unitSel,
      },
      orderBy: [{ StockIn: { Date: 'asc' } }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => ({
      kode: x.StockIn.Code, tanggal: ymd(x.StockIn.Date), gudang: x.StockIn.Warehouse.Name, supplier: x.StockIn.Supplier?.Name ?? '',
      kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: n(x.Quantity), satuan: unitName(x.Unit), harga: n(x.UnitPrice), subtotal: n(x.Subtotal),
    }));
  },
};

export const itemOutReport: ReportProvider = {
  key: 'item-out',
  group: 'Persediaan',
  title: 'Laporan Item Keluar',
  description: 'Rincian item yang keluar melalui transaksi stok keluar.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: [...dateRangeParams(), lookupParam('item', 'Item', 'products'), warehouseParam()],
  fields: [
    f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('gudang', 'Gudang'), f('keterangan', 'Keterangan'),
    f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('qty', 'Qty', 'number'), f('satuan', 'Satuan'),
    f('harga', 'Harga', 'currency'), f('subtotal', 'Subtotal', 'currency'),
  ],
  async run(p, ctx) {
    const g = int(p, 'gudang');
    const item = str(p, 'item');
    const rows: any[] = await ctx.prisma.stockOutItem.findMany({
      where: { ...(item ? { Product: { Code: item } } : {}), StockOut: { Date: dateFilter(p), ...okStatus, ...(g ? { WarehouseID: g } : {}) } },
      include: {
        StockOut: { select: { Code: true, Date: true, Description: true, Warehouse: { select: { Name: true } } } },
        Product: { select: { Code: true, Name: true } },
        Unit: unitSel,
      },
      orderBy: [{ StockOut: { Date: 'asc' } }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => ({
      kode: x.StockOut.Code, tanggal: ymd(x.StockOut.Date), gudang: x.StockOut.Warehouse.Name, keterangan: x.StockOut.Description ?? '',
      kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: n(x.Quantity), satuan: unitName(x.Unit), harga: n(x.UnitPrice), subtotal: n(x.Subtotal),
    }));
  },
};

export const itemTransferReport: ReportProvider = {
  key: 'item-transfer',
  group: 'Persediaan',
  title: 'Laporan Item Transfer',
  description: 'Rincian item yang dipindahkan antar gudang.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: [
    ...dateRangeParams(),
    lookupParam('item', 'Item', 'products'),
    { key: 'gudangAsal', label: 'Gudang Asal', type: 'select', source: { endpoint: 'warehouse', valueField: 'ID', labelField: 'Name' } },
    { key: 'gudangTujuan', label: 'Gudang Tujuan', type: 'select', source: { endpoint: 'warehouse', valueField: 'ID', labelField: 'Name' } },
  ],
  fields: [
    f('kode', 'Kode'), f('tanggal', 'Tanggal', 'date'), f('gudangasal', 'Gudang Asal'), f('gudangtujuan', 'Gudang Tujuan'),
    f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('qty', 'Qty', 'number'), f('satuan', 'Satuan'),
    f('harga', 'Harga', 'currency'), f('subtotal', 'Subtotal', 'currency'),
  ],
  async run(p, ctx) {
    const from = int(p, 'gudangAsal');
    const to = int(p, 'gudangTujuan');
    const item = str(p, 'item');
    const rows: any[] = await ctx.prisma.stockTransferItem.findMany({
      where: {
        ...(item ? { Product: { Code: item } } : {}),
        StockTransfer: { Date: dateFilter(p), ...okStatus, ...(from ? { FromWarehouseID: from } : {}), ...(to ? { ToWarehouseID: to } : {}) },
      },
      include: {
        StockTransfer: { select: { Code: true, Date: true, FromWarehouse: { select: { Name: true } }, ToWarehouse: { select: { Name: true } } } },
        Product: { select: { Code: true, Name: true } },
        Unit: unitSel,
      },
      orderBy: [{ StockTransfer: { Date: 'asc' } }, { ID: 'asc' }],
      take: MAX_ROWS,
    });
    return rows.map((x) => ({
      kode: x.StockTransfer.Code, tanggal: ymd(x.StockTransfer.Date), gudangasal: x.StockTransfer.FromWarehouse.Name, gudangtujuan: x.StockTransfer.ToWarehouse.Name,
      kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: n(x.Quantity), satuan: unitName(x.Unit), harga: n(x.UnitPrice), subtotal: n(x.Subtotal),
    }));
  },
};

// ─── Item Tidak Laku ────────────────────────────────────────
export const itemSlowMoving: ReportProvider = {
  key: 'item-slow-moving',
  group: 'Persediaan',
  title: 'Laporan Item Tidak Laku',
  description: 'Item aktif yang tidak terjual sama sekali, atau terjual kurang dari jumlah tertentu, pada periode.',
  required: ['tanggalDari', 'tanggalSampai'],
  params: [
    ...dateRangeParams(),
    warehouseParam(),
    { key: 'jenis', label: 'Jenis', type: 'select', source: { endpoint: 'categories', valueField: 'ID', labelField: 'Name' } },
    {
      key: 'kriteria', label: 'Kriteria Tidak Laku', type: 'select', defaultValue: 'none',
      options: [{ value: 'none', label: 'Tidak terjual sama sekali' }, { value: 'less', label: 'Terjual kurang dari jumlah' }],
    },
    { key: 'jumlah', label: 'Jumlah lebih kecil dari', type: 'text', defaultValue: '1' },
  ],
  fields: [
    f('kodeitem', 'Kode Item'), f('namaitem', 'Nama Item'), f('jenis', 'Jenis'), f('satuan', 'Satuan'),
    f('stok', 'Stok', 'number'), f('terjual', 'Qty Terjual', 'number'), f('terakhir', 'Terakhir Terjual', 'date'),
  ],
  async run(p, ctx) {
    const g = int(p, 'gudang');
    const jenis = int(p, 'jenis');
    const less = str(p, 'kriteria') === 'less';
    const limit = less ? (Number(str(p, 'jumlah')) || 1) : 0;
    const items: any[] = await ctx.prisma.saleItem.findMany({
      where: { Sale: { Date: dateFilter(p), IsReturn: false, PaymentStatus: { Code: { not: 'CANCELLED' } }, ...(g ? { WarehouseID: g } : {}) } },
      select: { ProductID: true, Quantity: true },
      take: 200000,
    });
    const sold = new Map<number, number>();
    for (const x of items) sold.set(x.ProductID, (sold.get(x.ProductID) ?? 0) + n(x.Quantity));
    const products: any[] = await ctx.prisma.product.findMany({
      where: { IsActive: true, ...(jenis ? { CategoryID: jenis } : {}) },
      select: {
        ID: true, Code: true, Name: true, Stock: true,
        Category: { select: { Name: true } }, Unit: unitSel,
        SaleItems: { select: { Sale: { select: { Date: true } } }, where: { Sale: { IsReturn: false } }, orderBy: { Sale: { Date: 'desc' } }, take: 1 },
      },
      orderBy: { Code: 'asc' },
      take: MAX_ROWS,
    });
    return products
      .filter((pr) => {
        const q = sold.get(pr.ID) ?? 0;
        return less ? q < limit : q === 0;
      })
      .map((pr) => ({
        kodeitem: pr.Code, namaitem: pr.Name, jenis: pr.Category?.Name ?? '', satuan: unitName(pr.Unit),
        stok: n(pr.Stock), terjual: sold.get(pr.ID) ?? 0, terakhir: ymd(pr.SaleItems[0]?.Sale?.Date),
      }));
  },
};

export const stockProviders = [stockList, stockMutation, stockOpnameReport, itemInReport, itemOutReport, itemTransferReport, itemSlowMoving];
