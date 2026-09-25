"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profitProviders = exports.saleProviders = exports.profitItemChart = exports.profitDetail = exports.chartCustomerVisits = exports.chartMonthly = exports.chartDaily = exports.chartBestItems = exports.customerPoints = exports.saleEmoneyPayments = exports.saleCardPayments = exports.saleByRegion = exports.saleBySupplier = exports.saleReturnByItem = exports.saleReturnReport = exports.profitSalesItem = exports.profitSales = exports.saleByCustomer = exports.saleByProduct = exports.saleDetail = exports.saleList = void 0;
exports.saleWhere = saleWhere;
const report_engine_types_1 = require("../report-engine.types");
const helpers_1 = require("../helpers");
const params = () => [
    ...(0, helpers_1.dateRangeParams)(),
    (0, helpers_1.lookupParam)('customerDari', 'Pelanggan Dari', 'customer'),
    (0, helpers_1.lookupParam)('customerSampai', 'Pelanggan Sampai', 'customer'),
    (0, helpers_1.warehouseParam)(),
    (0, helpers_1.paymentStatusParam)(),
];
function saleWhere(p) {
    const where = { PaymentStatus: { Code: { not: 'CANCELLED' } } };
    const st = (0, helpers_1.str)(p, 'status');
    if (st)
        where.PaymentStatus = { Code: st };
    const d = (0, helpers_1.dateFilter)(p);
    if (d)
        where.Date = d;
    const cr = (0, helpers_1.codeRange)(p, 'customerDari', 'customerSampai');
    if (cr)
        where.Customer = { Code: cr };
    const g = (0, helpers_1.int)(p, 'gudang');
    if (g)
        where.WarehouseID = g;
    return where;
}
const paidOf = (x) => x.SalePayments.reduce((s, y) => s + (0, helpers_1.n)(y.Amount), 0);
exports.saleList = {
    key: 'sale-list',
    group: 'Penjualan',
    title: 'Laporan Daftar Penjualan',
    description: 'Daftar transaksi penjualan beserta status pembayaran.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: params(),
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('pelanggan', 'Pelanggan'), (0, helpers_1.f)('sales', 'Sales'), (0, helpers_1.f)('gudang', 'Gudang'), (0, helpers_1.f)('status', 'Status'),
        (0, helpers_1.f)('total', 'Total', 'currency'), (0, helpers_1.f)('dibayar', 'Dibayar', 'currency'), (0, helpers_1.f)('sisa', 'Sisa', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.sale.findMany({
            where: saleWhere(p),
            include: {
                Customer: { select: { Name: true } }, SalesPerson: { select: { Name: true } }, Warehouse: { select: { Name: true } },
                PaymentStatus: { select: { Name: true } }, SalePayments: { select: { Amount: true } },
            },
            orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => {
            const paid = paidOf(x);
            return {
                kode: x.Code, tanggal: (0, helpers_1.ymd)(x.Date), pelanggan: x.Customer.Name, sales: x.SalesPerson?.Name ?? '', gudang: x.Warehouse?.Name ?? '',
                status: x.PaymentStatus.Name, total: (0, helpers_1.n)(x.Total), dibayar: paid, sisa: Math.max(0, (0, helpers_1.n)(x.Total) - paid),
            };
        });
    },
};
exports.saleDetail = {
    key: 'sale-detail',
    group: 'Penjualan',
    title: 'Laporan Detail Penjualan',
    description: 'Rincian penjualan per baris item.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: params(),
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('pelanggan', 'Pelanggan'), (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'),
        (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('satuan', 'Satuan'), (0, helpers_1.f)('harga', 'Harga', 'currency'), (0, helpers_1.f)('diskon', 'Diskon', 'currency'), (0, helpers_1.f)('subtotal', 'Subtotal', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.saleItem.findMany({
            where: { Sale: saleWhere(p) },
            include: {
                Sale: { select: { Code: true, Date: true, Customer: { select: { Name: true } } } },
                Product: { select: { Code: true, Name: true, Unit: { select: { Name: true, Abbreviation: true } } } },
                Unit: { select: { Name: true, Abbreviation: true } },
            },
            orderBy: [{ Sale: { Date: 'asc' } }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => {
            const u = x.Unit ?? x.Product.Unit;
            return {
                kode: x.Sale.Code, tanggal: (0, helpers_1.ymd)(x.Sale.Date), pelanggan: x.Sale.Customer.Name, kodeitem: x.Product.Code, namaitem: x.Product.Name,
                qty: (0, helpers_1.n)(x.Quantity), satuan: u?.Abbreviation || u?.Name || '', harga: (0, helpers_1.n)(x.UnitPrice), diskon: (0, helpers_1.n)(x.DiscountAmount), subtotal: (0, helpers_1.n)(x.Subtotal),
            };
        });
    },
};
exports.saleByProduct = {
    key: 'sale-by-product',
    group: 'Penjualan',
    title: 'Laporan Penjualan per Item',
    description: 'Qty dan omzet penjualan dikelompokkan per item.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: params(),
    fields: [(0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('omzet', 'Omzet', 'currency')],
    async run(p, ctx) {
        const rows = await ctx.prisma.saleItem.findMany({
            where: { Sale: saleWhere(p) },
            include: { Product: { select: { Code: true, Name: true } } },
            take: report_engine_types_1.MAX_ROWS,
        });
        const map = new Map();
        for (const x of rows) {
            const g = map.get(x.Product.Code) ?? { kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: 0, omzet: 0 };
            g.qty += (0, helpers_1.n)(x.Quantity);
            g.omzet += (0, helpers_1.n)(x.Subtotal);
            map.set(x.Product.Code, g);
        }
        return [...map.values()].sort((a, b) => b.omzet - a.omzet);
    },
};
exports.saleByCustomer = {
    key: 'sale-by-customer',
    group: 'Penjualan',
    title: 'Laporan Penjualan per Pelanggan',
    description: 'Total penjualan dikelompokkan per pelanggan.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: params(),
    fields: [
        (0, helpers_1.f)('kodepelanggan', 'Kode Pelanggan'), (0, helpers_1.f)('pelanggan', 'Pelanggan'), (0, helpers_1.f)('jmltransaksi', 'Jml Transaksi', 'number'),
        (0, helpers_1.f)('total', 'Total', 'currency'), (0, helpers_1.f)('dibayar', 'Dibayar', 'currency'), (0, helpers_1.f)('sisa', 'Sisa', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.sale.findMany({
            where: saleWhere(p),
            include: { Customer: { select: { Code: true, Name: true } }, SalePayments: { select: { Amount: true } } },
            take: report_engine_types_1.MAX_ROWS,
        });
        const map = new Map();
        for (const x of rows) {
            const g = map.get(x.Customer.Code) ?? { kodepelanggan: x.Customer.Code, pelanggan: x.Customer.Name, jmltransaksi: 0, total: 0, dibayar: 0, sisa: 0 };
            const paid = paidOf(x);
            g.jmltransaksi += 1;
            g.total += (0, helpers_1.n)(x.Total);
            g.dibayar += paid;
            g.sisa += Math.max(0, (0, helpers_1.n)(x.Total) - paid);
            map.set(x.Customer.Code, g);
        }
        return [...map.values()].sort((a, b) => a.kodepelanggan.localeCompare(b.kodepelanggan));
    },
};
const profitParams = () => [
    ...(0, helpers_1.dateRangeParams)(),
    (0, helpers_1.lookupParam)('customerDari', 'Pelanggan Dari', 'customer'),
    (0, helpers_1.lookupParam)('customerSampai', 'Pelanggan Sampai', 'customer'),
    (0, helpers_1.warehouseParam)(),
];
exports.profitSales = {
    key: 'profit-sales',
    group: 'Laba/Jual',
    title: 'Laporan Laba Penjualan per Transaksi',
    description: 'Omzet, HPP (berdasarkan harga beli item saat ini) dan laba per transaksi penjualan.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: profitParams(),
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('pelanggan', 'Pelanggan'),
        (0, helpers_1.f)('omzet', 'Omzet', 'currency'), (0, helpers_1.f)('hpp', 'HPP', 'currency'), (0, helpers_1.f)('laba', 'Laba', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.sale.findMany({
            where: { ...saleWhere(p), IsReturn: false },
            include: { Customer: { select: { Name: true } }, SaleItems: { include: { Product: { select: { PurchasePrice: true } } } } },
            orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => {
            const omzet = (0, helpers_1.n)(x.Subtotal) - (0, helpers_1.n)(x.DiscountAmount);
            const hpp = x.SaleItems.reduce((s, i) => s + (0, helpers_1.n)(i.Quantity) * (0, helpers_1.n)(i.Product.PurchasePrice), 0);
            return { kode: x.Code, tanggal: (0, helpers_1.ymd)(x.Date), pelanggan: x.Customer.Name, omzet, hpp, laba: omzet - hpp };
        });
    },
};
exports.profitSalesItem = {
    key: 'profit-sales-item',
    group: 'Laba/Jual',
    title: 'Laporan Laba Penjualan per Item',
    description: 'Omzet, HPP (berdasarkan harga beli item saat ini) dan laba per item.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: profitParams(),
    fields: [
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('qty', 'Qty', 'number'),
        (0, helpers_1.f)('omzet', 'Omzet', 'currency'), (0, helpers_1.f)('hpp', 'HPP', 'currency'), (0, helpers_1.f)('laba', 'Laba', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.saleItem.findMany({
            where: { Sale: { ...saleWhere(p), IsReturn: false } },
            include: { Product: { select: { Code: true, Name: true, PurchasePrice: true } } },
            take: report_engine_types_1.MAX_ROWS,
        });
        const map = new Map();
        for (const x of rows) {
            const g = map.get(x.Product.Code) ?? { kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: 0, omzet: 0, hpp: 0, laba: 0 };
            g.qty += (0, helpers_1.n)(x.Quantity);
            g.omzet += (0, helpers_1.n)(x.Subtotal);
            g.hpp += (0, helpers_1.n)(x.Quantity) * (0, helpers_1.n)(x.Product.PurchasePrice);
            g.laba = g.omzet - g.hpp;
            map.set(x.Product.Code, g);
        }
        return [...map.values()].sort((a, b) => b.laba - a.laba);
    },
};
const returnWhere = (p) => {
    const where = { Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } };
    const d = (0, helpers_1.dateFilter)(p);
    if (d)
        where.Date = d;
    const cr = (0, helpers_1.codeRange)(p, 'customerDari', 'customerSampai');
    if (cr)
        where.Customer = { Code: cr };
    const g = (0, helpers_1.int)(p, 'gudang');
    if (g)
        where.WarehouseID = g;
    return where;
};
const returnParams = () => [
    ...(0, helpers_1.dateRangeParams)(),
    (0, helpers_1.lookupParam)('customerDari', 'Pelanggan Dari', 'customer'),
    (0, helpers_1.lookupParam)('customerSampai', 'Pelanggan Sampai', 'customer'),
    (0, helpers_1.warehouseParam)(),
];
exports.saleReturnReport = {
    key: 'sale-return',
    group: 'Penjualan',
    title: 'Laporan Retur Penjualan',
    description: 'Daftar transaksi retur penjualan pada periode.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: returnParams(),
    fields: [
        (0, helpers_1.f)('kode', 'Kode Retur'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('kodejual', 'No Penjualan'), (0, helpers_1.f)('pelanggan', 'Pelanggan'),
        (0, helpers_1.f)('gudang', 'Gudang'), (0, helpers_1.f)('alasan', 'Alasan'), (0, helpers_1.f)('total', 'Total Retur', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.saleReturn.findMany({
            where: returnWhere(p),
            include: { Customer: { select: { Name: true } }, Sale: { select: { Code: true } }, Warehouse: { select: { Name: true } } },
            orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            kode: x.Code, tanggal: (0, helpers_1.ymd)(x.Date), kodejual: x.Sale?.Code ?? '', pelanggan: x.Customer.Name,
            gudang: x.Warehouse?.Name ?? '', alasan: x.Reason ?? '', total: (0, helpers_1.n)(x.TotalReturn),
        }));
    },
};
exports.saleReturnByItem = {
    key: 'sale-return-by-product',
    group: 'Penjualan',
    title: 'Laporan Retur Penjualan per Item',
    description: 'Qty dan nilai retur penjualan dikelompokkan per item.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: returnParams(),
    fields: [
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('satuan', 'Satuan'), (0, helpers_1.f)('jmlretur', 'Jml Retur', 'number'),
        (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('nilai', 'Nilai Retur', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.saleReturnItem.findMany({
            where: { SaleReturn: returnWhere(p) },
            include: { Product: { select: { Code: true, Name: true, Unit: { select: { Name: true, Abbreviation: true } } } }, Unit: { select: { Name: true, Abbreviation: true } } },
            take: report_engine_types_1.MAX_ROWS,
        });
        const map = new Map();
        for (const x of rows) {
            const u = x.Unit ?? x.Product.Unit;
            const g = map.get(x.Product.Code) ?? { kodeitem: x.Product.Code, namaitem: x.Product.Name, satuan: u?.Abbreviation || u?.Name || '', jmlretur: 0, qty: 0, nilai: 0 };
            g.jmlretur += 1;
            g.qty += (0, helpers_1.n)(x.Quantity);
            g.nilai += (0, helpers_1.n)(x.Subtotal);
            map.set(x.Product.Code, g);
        }
        return [...map.values()].sort((a, b) => b.nilai - a.nilai);
    },
};
exports.saleBySupplier = {
    key: 'sale-by-supplier',
    group: 'Penjualan',
    title: 'Laporan Penjualan per Supplier',
    description: 'Penjualan dikelompokkan per supplier. Supplier item ditentukan dari pembelian terakhir item tersebut.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [
        ...(0, helpers_1.dateRangeParams)(),
        (0, helpers_1.lookupParam)('supplierDari', 'Supplier Dari', 'supplier'),
        (0, helpers_1.lookupParam)('supplierSampai', 'Supplier Sampai', 'supplier'),
        (0, helpers_1.warehouseParam)(),
    ],
    fields: [
        (0, helpers_1.f)('kodesupplier', 'Kode Supplier'), (0, helpers_1.f)('supplier', 'Supplier'), (0, helpers_1.f)('jmlitem', 'Jml Item', 'number'),
        (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('omzet', 'Omzet', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.saleItem.findMany({
            where: { Sale: { ...saleWhere({ ...p, status: undefined }), IsReturn: false } },
            include: { Product: { select: { ID: true } } },
            take: report_engine_types_1.MAX_ROWS,
        });
        const ids = [...new Set(rows.map((x) => x.Product.ID))];
        const pis = ids.length
            ? await ctx.prisma.purchaseItem.findMany({
                where: { ProductID: { in: ids }, Purchase: { Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } } },
                select: { ProductID: true, Purchase: { select: { Supplier: { select: { Code: true, Name: true } } } } },
                orderBy: [{ Purchase: { Date: 'desc' } }, { ID: 'desc' }],
            })
            : [];
        const supOf = new Map();
        for (const pi of pis)
            if (!supOf.has(pi.ProductID))
                supOf.set(pi.ProductID, pi.Purchase.Supplier);
        const from = (0, helpers_1.str)(p, 'supplierDari');
        const to = (0, helpers_1.str)(p, 'supplierSampai');
        const map = new Map();
        const seen = new Map();
        for (const x of rows) {
            const sup = supOf.get(x.Product.ID);
            if ((from || to) && !sup)
                continue;
            if (sup && ((from && sup.Code < from) || (to && sup.Code > to)))
                continue;
            const k = sup?.Code ?? '';
            const g = map.get(k) ?? { kodesupplier: k, supplier: sup?.Name ?? '(Tanpa Supplier)', jmlitem: 0, qty: 0, omzet: 0 };
            const set = seen.get(k) ?? new Set();
            set.add(x.Product.ID);
            seen.set(k, set);
            g.jmlitem = set.size;
            g.qty += (0, helpers_1.n)(x.Quantity);
            g.omzet += (0, helpers_1.n)(x.Subtotal);
            map.set(k, g);
        }
        return [...map.values()].sort((a, b) => b.omzet - a.omzet);
    },
};
const wilayahOf = (addr) => {
    const parts = (addr ?? '').split(',').map((s) => s.trim()).filter(Boolean);
    return parts.length ? parts[parts.length - 1] : '(Tanpa Wilayah)';
};
exports.saleByRegion = {
    key: 'sale-by-region',
    group: 'Penjualan',
    title: 'Laporan Penjualan per Wilayah Pelanggan',
    description: 'Penjualan dikelompokkan per wilayah pelanggan (bagian terakhir alamat pelanggan).',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [
        ...(0, helpers_1.dateRangeParams)(),
        (0, helpers_1.lookupParam)('customerDari', 'Pelanggan Dari', 'customer'),
        (0, helpers_1.lookupParam)('customerSampai', 'Pelanggan Sampai', 'customer'),
        (0, helpers_1.warehouseParam)(),
    ],
    fields: [
        (0, helpers_1.f)('wilayah', 'Wilayah'), (0, helpers_1.f)('jmlpelanggan', 'Jml Pelanggan', 'number'), (0, helpers_1.f)('jmltransaksi', 'Jml Transaksi', 'number'), (0, helpers_1.f)('total', 'Total', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.sale.findMany({
            where: { ...saleWhere({ ...p, status: undefined }), IsReturn: false },
            include: { Customer: { select: { ID: true, Address: true } } },
            take: report_engine_types_1.MAX_ROWS,
        });
        const map = new Map();
        const cust = new Map();
        for (const x of rows) {
            const w = wilayahOf(x.Customer.Address);
            const g = map.get(w) ?? { wilayah: w, jmlpelanggan: 0, jmltransaksi: 0, total: 0 };
            const set = cust.get(w) ?? new Set();
            set.add(x.Customer.ID);
            cust.set(w, set);
            g.jmlpelanggan = set.size;
            g.jmltransaksi += 1;
            g.total += (0, helpers_1.n)(x.Total);
            map.set(w, g);
        }
        return [...map.values()].sort((a, b) => b.total - a.total);
    },
};
const CARD_WORDS = ['kartu', 'debit', 'kredit', 'credit', 'card', 'edc'];
const EMONEY_WORDS = ['e-money', 'emoney', 'e money', 'ovo', 'gopay', 'dana', 'shopee', 'linkaja', 'qris'];
const paymentReport = (key, title, description, words, methodLabel) => ({
    key,
    group: 'Penjualan',
    title,
    description,
    required: ['tanggalDari', 'tanggalSampai'],
    params: [
        ...(0, helpers_1.dateRangeParams)(),
        { key: 'metode', label: methodLabel, type: 'select', source: { endpoint: 'payment-methods', valueField: 'ID', labelField: 'Name' } },
        (0, helpers_1.warehouseParam)(),
    ],
    fields: [
        (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('kodejual', 'No Penjualan'), (0, helpers_1.f)('pelanggan', 'Pelanggan'), (0, helpers_1.f)('metode', 'Metode Bayar'),
        (0, helpers_1.f)('referensi', 'No Referensi'), (0, helpers_1.f)('jumlah', 'Jumlah', 'currency'),
    ],
    async run(p, ctx) {
        const m = (0, helpers_1.int)(p, 'metode');
        const g = (0, helpers_1.int)(p, 'gudang');
        const rows = await ctx.prisma.salePayment.findMany({
            where: {
                Date: (0, helpers_1.dateFilter)(p),
                Method: m ? { ID: m } : { OR: words.flatMap((w) => [{ Name: { contains: w, mode: 'insensitive' } }, { Code: { contains: w, mode: 'insensitive' } }]) },
                Sale: { PaymentStatus: { Code: { not: 'CANCELLED' } }, ...(g ? { WarehouseID: g } : {}) },
            },
            include: { Method: { select: { Name: true } }, Sale: { select: { Code: true, Customer: { select: { Name: true } } } } },
            orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            tanggal: (0, helpers_1.ymd)(x.Date), kodejual: x.Sale.Code, pelanggan: x.Sale.Customer.Name, metode: x.Method.Name,
            referensi: x.ReferenceNumber ?? '', jumlah: (0, helpers_1.n)(x.Amount),
        }));
    },
});
exports.saleCardPayments = paymentReport('sale-payment-card', 'Laporan Pembayaran dengan Kartu Bayar', 'Rekap pembayaran penjualan dengan kartu bayar (kartu debit / kredit).', CARD_WORDS, 'Kartu Bayar');
exports.saleEmoneyPayments = paymentReport('sale-payment-emoney', 'Laporan Pembayaran dengan E-Money', 'Rekap pembayaran penjualan dengan E-Money.', EMONEY_WORDS, 'Penyedia E-Money');
exports.customerPoints = {
    key: 'customer-points',
    group: 'Penjualan',
    title: 'Laporan Point Pelanggan',
    description: 'Saldo point pelanggan, total belanja dan point yang ditukar pada periode.',
    params: [
        ...(0, helpers_1.dateRangeParams)(),
        (0, helpers_1.lookupParam)('customerDari', 'Pelanggan Dari', 'customer'),
        (0, helpers_1.lookupParam)('customerSampai', 'Pelanggan Sampai', 'customer'),
    ],
    fields: [
        (0, helpers_1.f)('kode', 'Kode Pelanggan'), (0, helpers_1.f)('pelanggan', 'Pelanggan'), (0, helpers_1.f)('grup', 'Grup'), (0, helpers_1.f)('jmltransaksi', 'Jml Transaksi', 'number'),
        (0, helpers_1.f)('belanja', 'Total Belanja', 'currency'), (0, helpers_1.f)('poinditukar', 'Point Ditukar', 'number'), (0, helpers_1.f)('saldo', 'Saldo Point', 'number'),
    ],
    async run(p, ctx) {
        const cr = (0, helpers_1.codeRange)(p, 'customerDari', 'customerSampai');
        const d = (0, helpers_1.dateFilter)(p);
        const customers = await ctx.prisma.customer.findMany({
            where: cr ? { Code: cr } : {},
            select: { ID: true, Code: true, Name: true, PointBalance: true, CustomerGroup: { select: { Name: true } } },
            orderBy: { Code: 'asc' },
            take: report_engine_types_1.MAX_ROWS,
        });
        const ids = customers.map((c) => c.ID);
        const [sales, reds] = await Promise.all([
            ctx.prisma.sale.findMany({
                where: { CustomerID: { in: ids }, IsReturn: false, PaymentStatus: { Code: { not: 'CANCELLED' } }, ...(d ? { Date: d } : {}) },
                select: { CustomerID: true, Total: true },
            }),
            ctx.prisma.pointRedemption.findMany({ where: { CustomerID: { in: ids }, ...(d ? { Date: d } : {}) }, select: { CustomerID: true, PointsRedeemed: true } }),
        ]);
        const agg = new Map();
        const get = (id) => agg.get(id) ?? { jml: 0, belanja: 0, tukar: 0 };
        for (const s of sales) {
            const a = get(s.CustomerID);
            a.jml += 1;
            a.belanja += (0, helpers_1.n)(s.Total);
            agg.set(s.CustomerID, a);
        }
        for (const r of reds) {
            const a = get(r.CustomerID);
            a.tukar += (0, helpers_1.n)(r.PointsRedeemed);
            agg.set(r.CustomerID, a);
        }
        return customers
            .filter((c) => c.PointBalance !== 0 || agg.has(c.ID))
            .map((c) => {
            const a = get(c.ID);
            return { kode: c.Code, pelanggan: c.Name, grup: c.CustomerGroup?.Name ?? '', jmltransaksi: a.jml, belanja: a.belanja, poinditukar: a.tukar, saldo: (0, helpers_1.n)(c.PointBalance) };
        });
    },
};
const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const monthOptions = () => MONTHS.map((m, i) => ({ value: String(i + 1), label: m }));
const nowYear = () => Number((0, helpers_1.todayStr)().slice(0, 4));
const nowMonth = () => Number((0, helpers_1.todayStr)().slice(5, 7));
const pad2 = (v) => String(v).padStart(2, '0');
const monthParams = () => [
    { key: 'bulan', label: 'Bulan', type: 'select', options: monthOptions(), defaultValue: String(nowMonth()) },
    { key: 'tahun', label: 'Tahun', type: 'text', defaultValue: String(nowYear()) },
    (0, helpers_1.warehouseParam)(),
];
const yearParams = () => [
    { key: 'tahun', label: 'Tahun', type: 'text', defaultValue: String(nowYear()) },
    (0, helpers_1.warehouseParam)(),
];
const netSaleWhere = (p, gte, lte) => {
    const g = (0, helpers_1.int)(p, 'gudang');
    return { IsReturn: false, PaymentStatus: { Code: { not: 'CANCELLED' } }, Date: { gte, lte }, ...(g ? { WarehouseID: g } : {}) };
};
const topN = (p) => Math.max(1, Math.min(100, (0, helpers_1.int)(p, 'jumlah') ?? 10));
exports.chartBestItems = {
    key: 'chart-sale-best-items',
    group: 'Penjualan',
    title: 'Grafik Penjualan Item Terbaik',
    description: 'Item dengan penjualan (qty) terbanyak pada periode.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: [
        ...(0, helpers_1.dateRangeParams)(),
        (0, helpers_1.warehouseParam)(),
        { key: 'jenis', label: 'Jenis', type: 'select', source: { endpoint: 'categories', valueField: 'ID', labelField: 'Name' } },
        { key: 'jumlah', label: 'Jumlah Item', type: 'text', defaultValue: '10' },
    ],
    fields: [(0, helpers_1.f)('peringkat', 'No', 'number'), (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('omzet', 'Omzet', 'currency')],
    chart: { type: 'bar', labelField: 'namaitem', valueFields: [{ key: 'qty', label: 'Qty' }] },
    async run(p, ctx) {
        const jenis = (0, helpers_1.int)(p, 'jenis');
        const rows = await ctx.prisma.saleItem.findMany({
            where: { Sale: { ...saleWhere({ ...p, status: undefined }), IsReturn: false }, ...(jenis ? { Product: { CategoryID: jenis } } : {}) },
            include: { Product: { select: { Code: true, Name: true } } },
            take: report_engine_types_1.MAX_ROWS,
        });
        const map = new Map();
        for (const x of rows) {
            const g = map.get(x.Product.Code) ?? { kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: 0, omzet: 0 };
            g.qty += (0, helpers_1.n)(x.Quantity);
            g.omzet += (0, helpers_1.n)(x.Subtotal);
            map.set(x.Product.Code, g);
        }
        return [...map.values()].sort((a, b) => b.qty - a.qty).slice(0, topN(p)).map((r, i) => ({ peringkat: i + 1, ...r }));
    },
};
exports.chartDaily = {
    key: 'chart-sale-daily',
    group: 'Penjualan',
    title: 'Grafik Penjualan Harian',
    description: 'Omzet penjualan per hari dalam satu bulan.',
    required: ['bulan', 'tahun'],
    params: monthParams(),
    fields: [(0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('jmltransaksi', 'Jml Transaksi', 'number'), (0, helpers_1.f)('omzet', 'Omzet', 'currency')],
    chart: { type: 'line', labelField: 'tanggal', valueFields: [{ key: 'omzet', label: 'Omzet' }] },
    async run(p, ctx) {
        const y = (0, helpers_1.int)(p, 'tahun') ?? nowYear();
        const m = (0, helpers_1.int)(p, 'bulan') ?? nowMonth();
        const days = new Date(y, m, 0).getDate();
        const gte = (0, helpers_1.startOf)(`${y}-${pad2(m)}-01`);
        const lte = (0, helpers_1.endOf)(`${y}-${pad2(m)}-${pad2(days)}`);
        const sales = await ctx.prisma.sale.findMany({ where: netSaleWhere(p, gte, lte), select: { Date: true, Total: true } });
        const out = Array.from({ length: days }, (_, i) => ({ tanggal: `${y}-${pad2(m)}-${pad2(i + 1)}`, jmltransaksi: 0, omzet: 0 }));
        for (const s of sales) {
            const day = Number((0, helpers_1.ymd)(s.Date).slice(8, 10));
            if (out[day - 1]) {
                out[day - 1].jmltransaksi += 1;
                out[day - 1].omzet += (0, helpers_1.n)(s.Total);
            }
        }
        return out;
    },
};
exports.chartMonthly = {
    key: 'chart-sale-monthly',
    group: 'Penjualan',
    title: 'Grafik Penjualan Bulanan',
    description: 'Omzet penjualan per bulan dalam satu tahun.',
    required: ['tahun'],
    params: yearParams(),
    fields: [(0, helpers_1.f)('bulan', 'Bulan'), (0, helpers_1.f)('jmltransaksi', 'Jml Transaksi', 'number'), (0, helpers_1.f)('omzet', 'Omzet', 'currency')],
    chart: { type: 'bar', labelField: 'bulan', valueFields: [{ key: 'omzet', label: 'Omzet' }] },
    async run(p, ctx) {
        const y = (0, helpers_1.int)(p, 'tahun') ?? nowYear();
        const sales = await ctx.prisma.sale.findMany({ where: netSaleWhere(p, (0, helpers_1.startOf)(`${y}-01-01`), (0, helpers_1.endOf)(`${y}-12-31`)), select: { Date: true, Total: true } });
        const out = MONTHS.map((bulan) => ({ bulan, jmltransaksi: 0, omzet: 0 }));
        for (const s of sales) {
            const mi = Number((0, helpers_1.ymd)(s.Date).slice(5, 7)) - 1;
            out[mi].jmltransaksi += 1;
            out[mi].omzet += (0, helpers_1.n)(s.Total);
        }
        return out;
    },
};
exports.chartCustomerVisits = {
    key: 'chart-customer-visits',
    group: 'Penjualan',
    title: 'Grafik Kedatangan Pelanggan',
    description: 'Jumlah transaksi dan pelanggan berbeda yang datang per hari dalam satu bulan.',
    required: ['bulan', 'tahun'],
    params: monthParams(),
    fields: [(0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('jmltransaksi', 'Jml Transaksi', 'number'), (0, helpers_1.f)('jmlpelanggan', 'Jml Pelanggan', 'number')],
    chart: { type: 'bar', labelField: 'tanggal', valueFields: [{ key: 'jmltransaksi', label: 'Transaksi' }, { key: 'jmlpelanggan', label: 'Pelanggan' }] },
    async run(p, ctx) {
        const y = (0, helpers_1.int)(p, 'tahun') ?? nowYear();
        const m = (0, helpers_1.int)(p, 'bulan') ?? nowMonth();
        const days = new Date(y, m, 0).getDate();
        const sales = await ctx.prisma.sale.findMany({
            where: netSaleWhere(p, (0, helpers_1.startOf)(`${y}-${pad2(m)}-01`), (0, helpers_1.endOf)(`${y}-${pad2(m)}-${pad2(days)}`)),
            select: { Date: true, CustomerID: true },
        });
        const out = Array.from({ length: days }, (_, i) => ({ tanggal: `${y}-${pad2(m)}-${pad2(i + 1)}`, jmltransaksi: 0, jmlpelanggan: 0 }));
        const sets = out.map(() => new Set());
        for (const s of sales) {
            const day = Number((0, helpers_1.ymd)(s.Date).slice(8, 10));
            if (!out[day - 1])
                continue;
            out[day - 1].jmltransaksi += 1;
            sets[day - 1].add(s.CustomerID);
            out[day - 1].jmlpelanggan = sets[day - 1].size;
        }
        return out;
    },
};
exports.profitDetail = {
    key: 'profit-detail',
    group: 'Laba/Jual',
    title: 'Analisa Laba Jual Detail',
    description: 'Laba per baris item penjualan. Sumber harga pokok: harga beli item saat ini (transaksi tidak menyimpan snapshot HPP).',
    required: ['tanggalDari', 'tanggalSampai'],
    params: profitParams(),
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('pelanggan', 'Pelanggan'), (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'),
        (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('harga', 'Harga Jual', 'currency'), (0, helpers_1.f)('subtotal', 'Penjualan', 'currency'),
        (0, helpers_1.f)('hargapokok', 'Harga Pokok', 'currency'), (0, helpers_1.f)('hpp', 'HPP', 'currency'), (0, helpers_1.f)('laba', 'Laba', 'currency'), (0, helpers_1.f)('sumber', 'Sumber HPP'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.saleItem.findMany({
            where: { Sale: { ...saleWhere(p), IsReturn: false } },
            include: {
                Sale: { select: { Code: true, Date: true, Customer: { select: { Name: true } } } },
                Product: { select: { Code: true, Name: true, PurchasePrice: true } },
            },
            orderBy: [{ Sale: { Date: 'asc' } }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => {
            const hp = (0, helpers_1.n)(x.Product.PurchasePrice);
            const hpp = (0, helpers_1.n)(x.Quantity) * hp;
            return {
                kode: x.Sale.Code, tanggal: (0, helpers_1.ymd)(x.Sale.Date), pelanggan: x.Sale.Customer.Name, kodeitem: x.Product.Code, namaitem: x.Product.Name,
                qty: (0, helpers_1.n)(x.Quantity), harga: (0, helpers_1.n)(x.UnitPrice), subtotal: (0, helpers_1.n)(x.Subtotal), hargapokok: hp, hpp, laba: (0, helpers_1.n)(x.Subtotal) - hpp,
                sumber: 'Harga beli item saat ini',
            };
        });
    },
};
exports.profitItemChart = {
    ...exports.profitSalesItem,
    key: 'chart-profit-item',
    title: 'Grafik Laba Jual per Item',
    description: 'Laba penjualan per item (HPP berdasarkan harga beli item saat ini), diurutkan dari laba terbesar.',
    params: [
        ...exports.profitSalesItem.params.filter((x) => x.key !== 'customerDari' && x.key !== 'customerSampai'),
        { key: 'jumlah', label: 'Jumlah Item', type: 'text', defaultValue: '10' },
    ],
    chart: { type: 'bar', labelField: 'namaitem', valueFields: [{ key: 'laba', label: 'Laba' }] },
    async run(p, ctx) {
        const all = await exports.profitSalesItem.run(p, ctx);
        return all.slice(0, topN(p));
    },
};
exports.saleProviders = [
    exports.saleList, exports.saleDetail, exports.saleByProduct, exports.saleByCustomer,
    exports.saleReturnReport, exports.saleReturnByItem, exports.saleBySupplier, exports.saleByRegion, exports.saleCardPayments, exports.saleEmoneyPayments, exports.customerPoints,
    exports.chartBestItems, exports.chartDaily, exports.chartMonthly, exports.chartCustomerVisits,
];
exports.profitProviders = [exports.profitSales, exports.profitSalesItem, exports.profitDetail, exports.profitItemChart];
