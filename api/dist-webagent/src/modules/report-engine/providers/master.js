"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.masterProviders = exports.masterSales = exports.masterSuppliers = exports.masterCustomers = exports.masterItemsFull = exports.masterItems = void 0;
const report_engine_types_1 = require("../report-engine.types");
const helpers_1 = require("../helpers");
const itemFilterParams = () => [
    (0, helpers_1.lookupParam)('item', 'Item', 'products'),
    { key: 'jenis', label: 'Jenis', type: 'select', source: { endpoint: 'categories', valueField: 'ID', labelField: 'Name' } },
    (0, helpers_1.lookupParam)('supel', 'Supel', 'supplier'),
    (0, helpers_1.warehouseParam)(),
];
async function loadItems(p, ctx) {
    const where = {};
    const item = (0, helpers_1.str)(p, 'item');
    if (item)
        where.Code = item;
    const jenis = (0, helpers_1.int)(p, 'jenis');
    if (jenis)
        where.CategoryID = jenis;
    const supel = (0, helpers_1.str)(p, 'supel');
    if (supel)
        where.PurchaseItems = { some: { Purchase: { Supplier: { Code: supel } } } };
    const gudang = (0, helpers_1.int)(p, 'gudang');
    const products = await ctx.prisma.product.findMany({
        where,
        include: {
            Category: { select: { Name: true } },
            Brand: { select: { Name: true } },
            Unit: { select: { Name: true, Abbreviation: true } },
            ProductStocks: gudang ? { where: { WarehouseID: gudang } } : true,
            ShelfProducts: { include: { Shelf: { select: { Code: true, Name: true, WarehouseID: true } } } },
        },
        orderBy: { Code: 'asc' },
        take: report_engine_types_1.MAX_ROWS,
    });
    return products.map((pr) => {
        let stock;
        if (gudang) {
            const ps = pr.ProductStocks[0];
            stock = ps ? (0, helpers_1.n)(ps.Quantity) : pr.WarehouseID === gudang ? (0, helpers_1.n)(pr.Stock) : 0;
        }
        else if (pr.ProductStocks.length > 0) {
            stock = pr.ProductStocks.reduce((s, x) => s + (0, helpers_1.n)(x.Quantity), 0);
        }
        else {
            stock = (0, helpers_1.n)(pr.Stock);
        }
        const shelves = pr.ShelfProducts
            .filter((sp) => !gudang || sp.Shelf.WarehouseID === gudang)
            .map((sp) => sp.Shelf.Name)
            .join(', ');
        return { pr, stock, shelves };
    });
}
exports.masterItems = {
    key: 'master-items',
    group: 'Master',
    title: 'Laporan Daftar Item',
    description: 'Daftar item beserta jenis, rak, jumlah stok, satuan dan harga pokok.',
    params: itemFilterParams(),
    fields: [
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('jenis', 'Jenis'), (0, helpers_1.f)('rak', 'Rak'),
        (0, helpers_1.f)('jmlstok', 'Jml Stok', 'number'), (0, helpers_1.f)('satuan', 'Satuan'), (0, helpers_1.f)('hargapokok', 'Harga Pokok', 'currency'),
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
            hargapokok: (0, helpers_1.n)(pr.PurchasePrice),
        }));
    },
};
exports.masterItemsFull = {
    key: 'master-items-full',
    group: 'Master',
    title: 'Laporan Daftar Item lengkap',
    description: 'Daftar item lengkap: barcode, merek, harga pokok/jual, stok minimal dan keterangan.',
    params: itemFilterParams(),
    fields: [
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('barcode', 'Barcode'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('jenis', 'Jenis'),
        (0, helpers_1.f)('merek', 'Merek'), (0, helpers_1.f)('rak', 'Rak'), (0, helpers_1.f)('jmlstok', 'Jml Stok', 'number'), (0, helpers_1.f)('minimalstok', 'Minimal Stok', 'number'),
        (0, helpers_1.f)('satuan', 'Satuan'), (0, helpers_1.f)('hargapokok', 'Harga Pokok', 'currency'), (0, helpers_1.f)('hargajual', 'Harga Jual', 'currency'),
        (0, helpers_1.f)('keterangan', 'Keterangan'), (0, helpers_1.f)('aktif', 'Aktif'),
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
            minimalstok: (0, helpers_1.n)(pr.MinimumStock),
            satuan: pr.Unit?.Abbreviation || pr.Unit?.Name || '',
            hargapokok: (0, helpers_1.n)(pr.PurchasePrice),
            hargajual: (0, helpers_1.n)(pr.SellingPrice),
            keterangan: pr.Description ?? '',
            aktif: pr.IsActive ? 'Ya' : 'Tidak',
        }));
    },
};
exports.masterCustomers = {
    key: 'master-customers',
    group: 'Master',
    title: 'Laporan Daftar Pelanggan',
    description: 'Daftar pelanggan beserta kontak dan total piutang.',
    params: [(0, helpers_1.lookupParam)('customer', 'Pelanggan', 'customer')],
    fields: [
        (0, helpers_1.f)('code', 'Kode'), (0, helpers_1.f)('name', 'Nama'), (0, helpers_1.f)('address', 'Alamat'), (0, helpers_1.f)('phone', 'Telepon'), (0, helpers_1.f)('email', 'Email'),
        (0, helpers_1.f)('piutang', 'Total Piutang', 'currency'), (0, helpers_1.f)('keterangan', 'Keterangan'),
    ],
    async run(p, ctx) {
        const code = (0, helpers_1.str)(p, 'customer');
        const rows = await ctx.prisma.customer.findMany({ where: code ? { Code: code } : {}, orderBy: { Code: 'asc' }, take: report_engine_types_1.MAX_ROWS });
        return rows.map((c) => ({
            code: c.Code, name: c.Name, address: c.Address ?? '', phone: c.Phone ?? '', email: c.Email ?? '',
            piutang: (0, helpers_1.n)(c.TotalReceivable), keterangan: c.Notes ?? '',
        }));
    },
};
exports.masterSuppliers = {
    key: 'master-suppliers',
    group: 'Master',
    title: 'Laporan Daftar Supplier',
    description: 'Daftar supplier beserta kontak dan total hutang.',
    params: [(0, helpers_1.lookupParam)('supplier', 'Supplier', 'supplier')],
    fields: [
        (0, helpers_1.f)('code', 'Kode'), (0, helpers_1.f)('name', 'Nama'), (0, helpers_1.f)('address', 'Alamat'), (0, helpers_1.f)('phone', 'Telepon'), (0, helpers_1.f)('contact', 'Kontak'),
        (0, helpers_1.f)('email', 'Email'), (0, helpers_1.f)('hutang', 'Total Hutang', 'currency'), (0, helpers_1.f)('keterangan', 'Keterangan'),
    ],
    async run(p, ctx) {
        const code = (0, helpers_1.str)(p, 'supplier');
        const rows = await ctx.prisma.supplier.findMany({ where: code ? { Code: code } : {}, orderBy: { Code: 'asc' }, take: report_engine_types_1.MAX_ROWS });
        return rows.map((s) => ({
            code: s.Code, name: s.Name, address: s.Address ?? '', phone: s.Phone ?? '', contact: s.ContactPerson ?? '',
            email: s.Email ?? '', hutang: (0, helpers_1.n)(s.TotalDebt), keterangan: s.Notes ?? '',
        }));
    },
};
exports.masterSales = {
    key: 'master-sales',
    group: 'Master',
    title: 'Laporan Daftar Sales',
    description: 'Daftar tenaga penjual (sales person).',
    params: [],
    fields: [(0, helpers_1.f)('code', 'Kode'), (0, helpers_1.f)('name', 'Nama'), (0, helpers_1.f)('address', 'Alamat'), (0, helpers_1.f)('phone', 'Telepon'), (0, helpers_1.f)('email', 'Email'), (0, helpers_1.f)('aktif', 'Aktif')],
    async run(_p, ctx) {
        const rows = await ctx.prisma.salesPerson.findMany({ orderBy: { Code: 'asc' }, take: report_engine_types_1.MAX_ROWS });
        return rows.map((s) => ({
            code: s.Code, name: s.Name, address: s.Address ?? '', phone: s.Phone ?? '', email: s.Email ?? '',
            aktif: s.IsActive ? 'Ya' : 'Tidak',
        }));
    },
};
exports.masterProviders = [exports.masterItems, exports.masterItemsFull, exports.masterCustomers, exports.masterSuppliers, exports.masterSales];
