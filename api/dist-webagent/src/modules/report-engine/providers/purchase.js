"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseProviders = exports.purchaseByProduct = exports.purchaseReturnReport = exports.purchaseBySupplier = exports.purchaseDetail = exports.purchaseList = void 0;
exports.purchaseWhere = purchaseWhere;
const report_engine_types_1 = require("../report-engine.types");
const helpers_1 = require("../helpers");
const params = () => [
    ...(0, helpers_1.dateRangeParams)(),
    (0, helpers_1.lookupParam)('supplierDari', 'Supplier Dari', 'supplier'),
    (0, helpers_1.lookupParam)('supplierSampai', 'Supplier Sampai', 'supplier'),
    (0, helpers_1.warehouseParam)(),
    (0, helpers_1.paymentStatusParam)(),
];
function purchaseWhere(p) {
    const where = { Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } };
    const d = (0, helpers_1.dateFilter)(p);
    if (d)
        where.Date = d;
    const sr = (0, helpers_1.codeRange)(p, 'supplierDari', 'supplierSampai');
    if (sr)
        where.Supplier = { Code: sr };
    const g = (0, helpers_1.int)(p, 'gudang');
    if (g)
        where.WarehouseID = g;
    const st = (0, helpers_1.str)(p, 'status');
    if (st)
        where.PaymentStatus = { Code: st };
    return where;
}
exports.purchaseList = {
    key: 'purchase-list',
    group: 'Pembelian',
    title: 'Laporan Daftar Pembelian',
    description: 'Daftar transaksi pembelian beserta status pembayaran.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: params(),
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('supplier', 'Supplier'), (0, helpers_1.f)('gudang', 'Gudang'), (0, helpers_1.f)('status', 'Status'),
        (0, helpers_1.f)('total', 'Total', 'currency'), (0, helpers_1.f)('dibayar', 'Dibayar', 'currency'), (0, helpers_1.f)('sisa', 'Sisa', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.purchase.findMany({
            where: purchaseWhere(p),
            include: {
                Supplier: { select: { Code: true, Name: true } },
                Warehouse: { select: { Name: true } },
                PaymentStatus: { select: { Name: true } },
                PurchasePayments: { select: { Amount: true } },
            },
            orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => {
            const paid = x.PurchasePayments.reduce((s, y) => s + (0, helpers_1.n)(y.Amount), 0);
            return {
                kode: x.Code, tanggal: (0, helpers_1.ymd)(x.Date), supplier: x.Supplier.Name, gudang: x.Warehouse?.Name ?? '',
                status: x.PaymentStatus.Name, total: (0, helpers_1.n)(x.Total), dibayar: paid, sisa: Math.max(0, (0, helpers_1.n)(x.Total) - paid),
            };
        });
    },
};
exports.purchaseDetail = {
    key: 'purchase-detail',
    group: 'Pembelian',
    title: 'Laporan Detail Pembelian',
    description: 'Rincian pembelian per baris item.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: params(),
    fields: [
        (0, helpers_1.f)('kode', 'Kode'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('supplier', 'Supplier'), (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'),
        (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('satuan', 'Satuan'), (0, helpers_1.f)('harga', 'Harga', 'currency'), (0, helpers_1.f)('diskon', 'Diskon', 'currency'), (0, helpers_1.f)('subtotal', 'Subtotal', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.purchaseItem.findMany({
            where: { Purchase: purchaseWhere(p) },
            include: {
                Purchase: { select: { Code: true, Date: true, Supplier: { select: { Name: true } } } },
                Product: { select: { Code: true, Name: true } },
                Unit: { select: { Name: true, Abbreviation: true } },
            },
            orderBy: [{ Purchase: { Date: 'asc' } }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            kode: x.Purchase.Code, tanggal: (0, helpers_1.ymd)(x.Purchase.Date), supplier: x.Purchase.Supplier.Name,
            kodeitem: x.Product.Code, namaitem: x.Product.Name, qty: (0, helpers_1.n)(x.Quantity),
            satuan: x.Unit?.Abbreviation || x.Unit?.Name || '', harga: (0, helpers_1.n)(x.UnitPrice), diskon: (0, helpers_1.n)(x.DiscountAmount), subtotal: (0, helpers_1.n)(x.Subtotal),
        }));
    },
};
exports.purchaseBySupplier = {
    key: 'purchase-by-supplier',
    group: 'Pembelian',
    title: 'Laporan Pembelian per Supplier',
    description: 'Total pembelian dikelompokkan per supplier.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: params(),
    fields: [
        (0, helpers_1.f)('kodesupplier', 'Kode Supplier'), (0, helpers_1.f)('supplier', 'Supplier'), (0, helpers_1.f)('jmltransaksi', 'Jml Transaksi', 'number'),
        (0, helpers_1.f)('total', 'Total', 'currency'), (0, helpers_1.f)('dibayar', 'Dibayar', 'currency'), (0, helpers_1.f)('sisa', 'Sisa', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.purchase.findMany({
            where: purchaseWhere(p),
            include: { Supplier: { select: { Code: true, Name: true } }, PurchasePayments: { select: { Amount: true } } },
            take: report_engine_types_1.MAX_ROWS,
        });
        const map = new Map();
        for (const x of rows) {
            const g = map.get(x.Supplier.Code) ?? { kodesupplier: x.Supplier.Code, supplier: x.Supplier.Name, jmltransaksi: 0, total: 0, dibayar: 0, sisa: 0 };
            const paid = x.PurchasePayments.reduce((s, y) => s + (0, helpers_1.n)(y.Amount), 0);
            g.jmltransaksi += 1;
            g.total += (0, helpers_1.n)(x.Total);
            g.dibayar += paid;
            g.sisa += Math.max(0, (0, helpers_1.n)(x.Total) - paid);
            map.set(x.Supplier.Code, g);
        }
        return [...map.values()].sort((a, b) => a.kodesupplier.localeCompare(b.kodesupplier));
    },
};
const returnWhere = (p) => {
    const where = { Status: { Code: { notIn: ['CANCELLED', 'REJECTED'] } } };
    const d = (0, helpers_1.dateFilter)(p);
    if (d)
        where.Date = d;
    const sr = (0, helpers_1.codeRange)(p, 'supplierDari', 'supplierSampai');
    if (sr)
        where.Supplier = { Code: sr };
    const g = (0, helpers_1.int)(p, 'gudang');
    if (g)
        where.WarehouseID = g;
    return where;
};
const returnParams = () => [
    ...(0, helpers_1.dateRangeParams)(),
    (0, helpers_1.lookupParam)('supplierDari', 'Supplier Dari', 'supplier'),
    (0, helpers_1.lookupParam)('supplierSampai', 'Supplier Sampai', 'supplier'),
    (0, helpers_1.warehouseParam)(),
];
exports.purchaseReturnReport = {
    key: 'purchase-return',
    group: 'Pembelian',
    title: 'Laporan Retur Pembelian',
    description: 'Daftar transaksi retur pembelian pada periode.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: returnParams(),
    fields: [
        (0, helpers_1.f)('kode', 'Kode Retur'), (0, helpers_1.f)('tanggal', 'Tanggal', 'date'), (0, helpers_1.f)('kodebeli', 'No Pembelian'), (0, helpers_1.f)('supplier', 'Supplier'),
        (0, helpers_1.f)('gudang', 'Gudang'), (0, helpers_1.f)('alasan', 'Alasan'), (0, helpers_1.f)('total', 'Total Retur', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.purchaseReturn.findMany({
            where: returnWhere(p),
            include: { Supplier: { select: { Name: true } }, Purchase: { select: { Code: true } }, Warehouse: { select: { Name: true } } },
            orderBy: [{ Date: 'asc' }, { ID: 'asc' }],
            take: report_engine_types_1.MAX_ROWS,
        });
        return rows.map((x) => ({
            kode: x.Code, tanggal: (0, helpers_1.ymd)(x.Date), kodebeli: x.Purchase?.Code ?? '', supplier: x.Supplier.Name,
            gudang: x.Warehouse?.Name ?? '', alasan: x.Reason ?? '', total: (0, helpers_1.n)(x.TotalReturn),
        }));
    },
};
exports.purchaseByProduct = {
    key: 'purchase-by-product',
    group: 'Pembelian',
    title: 'Laporan Pembelian per Item',
    description: 'Qty dan nilai pembelian dikelompokkan per item.',
    required: ['tanggalDari', 'tanggalSampai'],
    params: params(),
    fields: [
        (0, helpers_1.f)('kodeitem', 'Kode Item'), (0, helpers_1.f)('namaitem', 'Nama Item'), (0, helpers_1.f)('satuan', 'Satuan'), (0, helpers_1.f)('jmltransaksi', 'Jml Transaksi', 'number'),
        (0, helpers_1.f)('qty', 'Qty', 'number'), (0, helpers_1.f)('total', 'Total Pembelian', 'currency'), (0, helpers_1.f)('hargarata', 'Harga Rata-rata', 'currency'),
    ],
    async run(p, ctx) {
        const rows = await ctx.prisma.purchaseItem.findMany({
            where: { Purchase: purchaseWhere(p) },
            include: { Product: { select: { Code: true, Name: true } }, Unit: { select: { Name: true, Abbreviation: true } } },
            take: report_engine_types_1.MAX_ROWS,
        });
        const map = new Map();
        for (const x of rows) {
            const g = map.get(x.Product.Code) ?? {
                kodeitem: x.Product.Code, namaitem: x.Product.Name, satuan: x.Unit?.Abbreviation || x.Unit?.Name || '',
                jmltransaksi: 0, qty: 0, total: 0, hargarata: 0,
            };
            g.jmltransaksi += 1;
            g.qty += (0, helpers_1.n)(x.Quantity);
            g.total += (0, helpers_1.n)(x.Subtotal);
            g.hargarata = g.qty ? g.total / g.qty : 0;
            map.set(x.Product.Code, g);
        }
        return [...map.values()].sort((a, b) => b.total - a.total);
    },
};
exports.purchaseProviders = [exports.purchaseList, exports.purchaseDetail, exports.purchaseBySupplier, exports.purchaseReturnReport, exports.purchaseByProduct];
