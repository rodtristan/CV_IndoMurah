"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stockProviders = exports.itemSlowMoving = exports.itemTransferReport = exports.itemOutReport = exports.itemInReport = exports.stockOpnameReport = exports.stockMutation = exports.stockList = void 0;
const report_engine_types_1 = require("../report-engine.types");
const helpers_1 = require("../helpers");
const unitName = (u) => u?.Abbreviation || u?.Name || '';
exports.stockList = {
    key: 'stock-list',
    group: 'Persediaan',
    title: 'Laporan Stok Barang',
    description: 'Stok per item per gudang beserta nilai persediaan (harga pokok).',
    params: [
        (0, helpers_1.lookupParam)('item', 'Item', 'products'),
        { key: 'jenis', label: 'Jenis', type: 'select', source: { endpoint: 'categories', valueField: 'ID', labelField: 'Name' } },
        (0, helpers_1.warehouseParam)(),
        { key: 'hanyaStok', label: 'Hanya stok > 0', type: 'checkbox', defaultValue: false },
    ],
    fields: [
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('jenis', 'Jenis'), (0, helpers_1.f)('gudang', 'Gudang'),
        (0, helpers_1.f)('stok', 'Stok', 'number'), (0, helpers_1.f)('minimal', 'Stok Minimal', 'number'), (0, helpers_1.f)('satuan', 'Satuan'),
        (0, helpers_1.f)('hargapokok', 'Harga Pokok', 'currency'), (0, helpers_1.f)('nilai', 'Nilai Persediaan', 'currency'),
    ],
    async run(p, ctx) {
        const where = {};
        const item = (0, helpers_1.str)(p, 'item');
        if (item)
            where.Code = item;
        const jenis = (0, helpers_1.int)(p, 'jenis');
        if (jenis)
            where.CategoryID = jenis;
        const g = (0, helpers_1.int)(p, 'gudang');
        const onlyStock = p?.hanyaStok === true || p?.hanyaStok === 'true';
        const products = await ctx.prisma.product.findMany({
            where,
            include: {
                Category: { select: { Name: true } },
                Unit: { select: { Name: true, Abbreviation: true } },
                Warehouse: { select: { ID: true, Name: true } },
                ProductStocks: { include: { Warehouse: { select: { Name: true } } } },
            },
            orderBy: { Code: 'asc' },
            take: report_engine_types_1.MAX_ROWS,
        });
        const out = [];
        for (const pr of products) {
            const parts = pr.ProductStocks.length > 0
                ? pr.ProductStocks.map((s) => ({ gudang: s.Warehouse.Name, wid: s.WarehouseID, qty: (0, helpers_1.n)(s.Quantity), min: (0, helpers_1.n)(s.MinimumStock) }))
                : [{ gudang: pr.Warehouse?.Name ?? '', wid: pr.WarehouseID ?? null, qty: (0, helpers_1.n)(pr.Stock), min: (0, helpers_1.n)(pr.MinimumStock) }];
            for (const s of parts) {
                if (g && s.wid !== g)
                    continue;
                if (onlyStock && s.qty <= 0)
                    continue;
                out.push({
                    kodeitem: pr.Code, namaitem: pr.Name, jenis: pr.Category?.Name ?? '', gudang: s.gudang, stok: s.qty, minimal: s.min,
                    satuan: unitName(pr.Unit), hargapokok: (0, helpers_1.n)(pr.PurchasePrice), nilai: s.qty * (0, helpers_1.n)(pr.PurchasePrice),
                });
            }
        }
        return out;
    },
};
exports.stockMutation = {
    key: 'stock-mutation',
    group: 'Persediaan',
    title: 'Laporan Mutasi Stok',
    description: 'Pergerakan barang masuk (pembelian, stok masuk) dan keluar (penjualan, stok keluar) per item pada periode.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [...(0, helpers_1.dateRangeParams)(), (0, helpers_1.lookupParam)('item', 'Item', 'products'), (0, helpers_1.warehouseParam)()],
    fields: [
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('satuan', 'Satuan'),
        (0, helpers_1.f)('pembelian', 'Pembelian', 'number'), (0, helpers_1.f)('stokmasuk', 'Stok Masuk', 'number'), (0, helpers_1.f)('totalmasuk', 'Total Masuk', 'number'),
        (0, helpers_1.f)('penjualan', 'Penjualan', 'number'), (0, helpers_1.f)('stokkeluar', 'Stok Keluar', 'number'), (0, helpers_1.f)('totalkeluar', 'Total Keluar', 'number'),
        (0, helpers_1.f)('stokakhir', 'Stok Saat Ini', 'number'),
    ],
    async run(p, ctx) {
        const d = (0, helpers_1.dateFilter)(p);
        const g = (0, helpers_1.int)(p, 'gudang');
        const item = (0, helpers_1.str)(p, 'item');
        const wh = g ? { WarehouseID: g } : {};
        const pw = item ? { Product: { Code: item } } : {};
        const sel = { Product: { select: { ID: true, Code: true, Name: true, Stock: true, Unit: { select: { Name: true, Abbreviation: true } } } } };
        const [pi, si, sti, sto] = await Promise.all([
            ctx.prisma.purchaseItem.findMany({ where: { ...pw, Purchase: { ...wh, Date: d, Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } } }, include: sel, take: report_engine_types_1.MAX_ROWS }),
            ctx.prisma.saleItem.findMany({ where: { ...pw, Sale: { ...wh, Date: d, IsReturn: false, PaymentStatus: { Code: { not: 'CANCELLED' } } } }, include: sel, take: report_engine_types_1.MAX_ROWS }),
            ctx.prisma.stockInItem.findMany({ where: { ...pw, StockIn: { ...wh, Date: d } }, include: sel, take: report_engine_types_1.MAX_ROWS }),
            ctx.prisma.stockOutItem.findMany({ where: { ...pw, StockOut: { ...wh, Date: d } }, include: sel, take: report_engine_types_1.MAX_ROWS }),
        ]);
        const map = new Map();
        const add = (list, field) => {
            for (const x of list) {
                const pr = x.Product;
                const g0 = map.get(pr.ID) ?? {
                    kodeitem: pr.Code, namaitem: pr.Name, satuan: unitName(pr.Unit), pembelian: 0, stokmasuk: 0, totalmasuk: 0,
                    penjualan: 0, stokkeluar: 0, totalkeluar: 0, stokakhir: (0, helpers_1.n)(pr.Stock),
                };
                g0[field] += (0, helpers_1.n)(x.Quantity);
                map.set(pr.ID, g0);
            }
        };
        add(pi, 'pembelian');
        add(sti, 'stokmasuk');
        add(si, 'penjualan');
        add(sto, 'stokkeluar');
        const rows = [...map.values()];
        for (const r of rows) {
            r.totalmasuk = r.pembelian + r.stokmasuk;
            r.totalkeluar = r.penjualan + r.stokkeluar;
        }
        return rows.sort((a, b) => a.kodeitem.localeCompare(b.kodeitem));
    },
};
exports.stockOpnameReport = {
    key: 'stock-opname',
    group: 'Persediaan',
    title: 'Laporan Stok Opname',
    description: 'Hasil stok opname per item: stok sistem, stok hitung dan selisih.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [...(0, helpers_1.dateRangeParams)(), (0, helpers_1.warehouseParam)()],
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('gudang', 'Gudang'), (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'),
        (0, helpers_1.f)('satuan', 'Satuan'), (0, helpers_1.f)('stoksistem', 'Stok Sistem', 'number'), (0, helpers_1.f)('stokhitung', 'Stok Hitung', 'number'),
        (0, helpers_1.f)('selisih', 'Selisih', 'number'), (0, helpers_1.f)('nilaiselisih', 'Nilai Selisih', 'currency'), (0, helpers_1.f)('catatan', 'Catatan'),
    ],
    async run(p, ctx) {
        const g = (0, helpers_1.int)(p, 'gudang');
        const rows = await ctx.prisma.stockOpnameItem.findMany({
            where: { StockOpname: { Date: (0, helpers_1.dateFilter)(p), ...(g ? { WarehouseID: g } : {}) } },
            include: {
                StockOpname: { select: { Code: true, Date: true, Warehouse: { select: { Name: true } } } },
                Product: { select: { Code: true, Name: true } },
                Unit: { select: { Name: true, Abbreviation: true } },
            },
            orderBy: [{ StockOpname: { Date: 'asc' } }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            kode: x.StockOpname.Code, tanggal: (0, helpers_1.ymd)(x.StockOpname.Date), gudang: x.StockOpname.Warehouse.Name,
            kodeitem: x.Product.Code, namaitem: x.Product.Name, satuan: unitName(x.Unit),
            stoksistem: (0, helpers_1.n)(x.SystemStock), stokhitung: (0, helpers_1.n)(x.CountedStock), selisih: (0, helpers_1.n)(x.Difference),
            nilaiselisih: (0, helpers_1.n)(x.Difference) * (0, helpers_1.n)(x.UnitPrice), catatan: x.Note ?? '',
        }));
    },
};
const okStatus = { Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } };
const unitSel = { select: { Name: true, Abbreviation: true } };
exports.itemInReport = {
    key: 'item-in',
    group: 'Persediaan',
    title: 'Laporan Item Masuk',
    description: 'Rincian item yang masuk melalui transaksi stok masuk.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [...(0, helpers_1.dateRangeParams)(), (0, helpers_1.lookupParam)('item', 'Item', 'products'), (0, helpers_1.warehouseParam)()],
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('gudang', 'Gudang'), (0, helpers_1.f)('supplier', 'Supplier'),
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('satuan', 'Satuan'),
        (0, helpers_1.f)('harga', 'Harga', 'currency'), (0, helpers_1.f)('subtotal', 'Subtotal', 'currency'),
    ],
    async run(p, ctx) {
        const g = (0, helpers_1.int)(p, 'gudang');
        const item = (0, helpers_1.str)(p, 'item');
        const rows = await ctx.prisma.stockInItem.findMany({
            where: { ...(item ? { Product: { Code: item } } : {}), StockIn: { Date: (0, helpers_1.dateFilter)(p), ...okStatus, ...(g ? { WarehouseID: g } : {}) } },
            include: {
                StockIn: { select: { Code: true, Date: true, Warehouse: { select: { Name: true } }, Supplier: { select: { Name: true } } } },
                Product: { select: { Code: true, Name: true } },
                Unit: unitSel,
            },
            orderBy: [{ StockIn: { Date: 'asc' } }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            kode: x.StockIn.Code, tanggal: (0, helpers_1.ymd)(x.StockIn.Date), gudang: x.StockIn.Warehouse.Name, supplier: x.StockIn.Supplier?.Name ?? '',
            kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: (0, helpers_1.n)(x.Quantity), satuan: unitName(x.Unit), harga: (0, helpers_1.n)(x.UnitPrice), subtotal: (0, helpers_1.n)(x.Subtotal),
        }));
    },
};
exports.itemOutReport = {
    key: 'item-out',
    group: 'Persediaan',
    title: 'Laporan Item Keluar',
    description: 'Rincian item yang keluar melalui transaksi stok keluar.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [...(0, helpers_1.dateRangeParams)(), (0, helpers_1.lookupParam)('item', 'Item', 'products'), (0, helpers_1.warehouseParam)()],
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('gudang', 'Gudang'), (0, helpers_1.f)('keterangan', 'Keterangan'),
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('satuan', 'Satuan'),
        (0, helpers_1.f)('harga', 'Harga', 'currency'), (0, helpers_1.f)('subtotal', 'Subtotal', 'currency'),
    ],
    async run(p, ctx) {
        const g = (0, helpers_1.int)(p, 'gudang');
        const item = (0, helpers_1.str)(p, 'item');
        const rows = await ctx.prisma.stockOutItem.findMany({
            where: { ...(item ? { Product: { Code: item } } : {}), StockOut: { Date: (0, helpers_1.dateFilter)(p), ...okStatus, ...(g ? { WarehouseID: g } : {}) } },
            include: {
                StockOut: { select: { Code: true, Date: true, Description: true, Warehouse: { select: { Name: true } } } },
                Product: { select: { Code: true, Name: true } },
                Unit: unitSel,
            },
            orderBy: [{ StockOut: { Date: 'asc' } }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            kode: x.StockOut.Code, tanggal: (0, helpers_1.ymd)(x.StockOut.Date), gudang: x.StockOut.Warehouse.Name, keterangan: x.StockOut.Description ?? '',
            kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: (0, helpers_1.n)(x.Quantity), satuan: unitName(x.Unit), harga: (0, helpers_1.n)(x.UnitPrice), subtotal: (0, helpers_1.n)(x.Subtotal),
        }));
    },
};
exports.itemTransferReport = {
    key: 'item-transfer',
    group: 'Persediaan',
    title: 'Laporan Item Transfer',
    description: 'Rincian item yang dipindahkan antar gudang.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [
        ...(0, helpers_1.dateRangeParams)(),
        (0, helpers_1.lookupParam)('item', 'Item', 'products'),
        { key: 'gudangAsal', label: 'Gudang Asal', type: 'select', source: { endpoint: 'warehouse', valueField: 'ID', labelField: 'Name' } },
        { key: 'gudangTujuan', label: 'Gudang Tujuan', type: 'select', source: { endpoint: 'warehouse', valueField: 'ID', labelField: 'Name' } },
    ],
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('gudangasal', 'Gudang Asal'), (0, helpers_1.f)('gudangtujuan', 'Gudang Tujuan'),
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('satuan', 'Satuan'),
        (0, helpers_1.f)('harga', 'Harga', 'currency'), (0, helpers_1.f)('subtotal', 'Subtotal', 'currency'),
    ],
    async run(p, ctx) {
        const from = (0, helpers_1.int)(p, 'gudangAsal');
        const to = (0, helpers_1.int)(p, 'gudangTujuan');
        const item = (0, helpers_1.str)(p, 'item');
        const rows = await ctx.prisma.stockTransferItem.findMany({
            where: {
                ...(item ? { Product: { Code: item } } : {}),
                StockTransfer: { Date: (0, helpers_1.dateFilter)(p), ...okStatus, ...(from ? { FromWarehouseID: from } : {}), ...(to ? { ToWarehouseID: to } : {}) },
            },
            include: {
                StockTransfer: { select: { Code: true, Date: true, FromWarehouse: { select: { Name: true } }, ToWarehouse: { select: { Name: true } } } },
                Product: { select: { Code: true, Name: true } },
                Unit: unitSel,
            },
            orderBy: [{ StockTransfer: { Date: 'asc' } }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            kode: x.StockTransfer.Code, tanggal: (0, helpers_1.ymd)(x.StockTransfer.Date), gudangasal: x.StockTransfer.FromWarehouse.Name, gudangtujuan: x.StockTransfer.ToWarehouse.Name,
            kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: (0, helpers_1.n)(x.Quantity), satuan: unitName(x.Unit), harga: (0, helpers_1.n)(x.UnitPrice), subtotal: (0, helpers_1.n)(x.Subtotal),
        }));
    },
};
exports.itemSlowMoving = {
    key: 'item-slow-moving',
    group: 'Persediaan',
    title: 'Laporan Item Tidak Laku',
    description: 'Item aktif yang tidak terjual sama sekali, atau terjual kurang dari jumlah tertentu, pada periode.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [
        ...(0, helpers_1.dateRangeParams)(),
        (0, helpers_1.warehouseParam)(),
        { key: 'jenis', label: 'Jenis', type: 'select', source: { endpoint: 'categories', valueField: 'ID', labelField: 'Name' } },
        {
            key: 'kriteria', label: 'Kriteria Tidak Laku', type: 'select', defaultValue: 'none',
            options: [{ value: 'none', label: 'Tidak terjual sama sekali' }, { value: 'less', label: 'Terjual kurang dari jumlah' }],
        },
        { key: 'jumlah', label: 'Jumlah lebih kecil dari', type: 'text', defaultValue: '1' },
    ],
    fields: [
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('jenis', 'Jenis'), (0, helpers_1.f)('satuan', 'Satuan'),
        (0, helpers_1.f)('stok', 'Stok', 'number'), (0, helpers_1.f)('terjual', 'Qty Terjual', 'number'), (0, helpers_1.f)('terakhir', 'Terakhir Terjual', 'date'),
    ],
    async run(p, ctx) {
        const g = (0, helpers_1.int)(p, 'gudang');
        const jenis = (0, helpers_1.int)(p, 'jenis');
        const less = (0, helpers_1.str)(p, 'kriteria') === 'less';
        const limit = less ? (Number((0, helpers_1.str)(p, 'jumlah')) || 1) : 0;
        const items = await ctx.prisma.saleItem.findMany({
            where: { Sale: { Date: (0, helpers_1.dateFilter)(p), IsReturn: false, PaymentStatus: { Code: { not: 'CANCELLED' } }, ...(g ? { WarehouseID: g } : {}) } },
            select: { ProductID: true, Quantity: true },
            take: 200000,
        });
        const sold = new Map();
        for (const x of items)
            sold.set(x.ProductID, (sold.get(x.ProductID) ?? 0) + (0, helpers_1.n)(x.Quantity));
        const products = await ctx.prisma.product.findMany({
            where: { IsActive: true, ...(jenis ? { CategoryID: jenis } : {}) },
            select: {
                ID: true, Code: true, Name: true, Stock: true,
                Category: { select: { Name: true } }, Unit: unitSel,
                SaleItems: { select: { Sale: { select: { Date: true } } }, where: { Sale: { IsReturn: false } }, orderBy: { Sale: { Date: 'desc' } }, take: 1 },
            },
            orderBy: { Code: 'asc' },
            take: report_engine_types_1.MAX_ROWS,
        });
        return products
            .filter((pr) => {
            const q = sold.get(pr.ID) ?? 0;
            return less ? q < limit : q === 0;
        })
            .map((pr) => ({
            kodeitem: pr.Code, namaitem: pr.Name, jenis: pr.Category?.Name ?? '', satuan: unitName(pr.Unit),
            stok: (0, helpers_1.n)(pr.Stock), terjual: sold.get(pr.ID) ?? 0, terakhir: (0, helpers_1.ymd)(pr.SaleItems[0]?.Sale?.Date),
        }));
    },
};
exports.stockProviders = [exports.stockList, exports.stockMutation, exports.stockOpnameReport, exports.itemInReport, exports.itemOutReport, exports.itemTransferReport, exports.itemSlowMoving];
