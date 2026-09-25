"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAccounting = seedAccounting;
const COA = [
    { code: '1-1000', name: 'Kas & Bank', type: 'ASSET' },
    { code: '1-1100', name: 'Kas', type: 'ASSET', parent: '1-1000' },
    { code: '1-1200', name: 'Bank', type: 'ASSET', parent: '1-1000' },
    { code: '1-1300', name: 'Piutang Usaha', type: 'ASSET' },
    { code: '1-1400', name: 'Persediaan Barang', type: 'ASSET' },
    { code: '1-1500', name: 'PPN Masukan', type: 'ASSET' },
    { code: '1-1600', name: 'Uang Muka Supplier', type: 'ASSET' },
    { code: '1-2000', name: 'Aset Tetap', type: 'ASSET' },
    { code: '1-2100', name: 'Peralatan', type: 'ASSET', parent: '1-2000' },
    { code: '1-2900', name: 'Akumulasi Penyusutan', type: 'ASSET', parent: '1-2000' },
    { code: '2-1100', name: 'Hutang Usaha', type: 'LIABILITY' },
    { code: '2-1200', name: 'PPN Keluaran', type: 'LIABILITY' },
    { code: '2-1300', name: 'Uang Muka Pelanggan', type: 'LIABILITY' },
    { code: '2-2000', name: 'Hutang Bank', type: 'LIABILITY' },
    { code: '3-1000', name: 'Modal Disetor', type: 'EQUITY' },
    { code: '3-2000', name: 'Laba Ditahan', type: 'EQUITY' },
    { code: '3-3000', name: 'Laba Tahun Berjalan', type: 'EQUITY' },
    { code: '4-1000', name: 'Penjualan', type: 'REVENUE' },
    { code: '4-1100', name: 'Potongan Penjualan', type: 'REVENUE' },
    { code: '4-1200', name: 'Retur Penjualan', type: 'REVENUE' },
    { code: '4-1300', name: 'Pendapatan Ongkos Kirim', type: 'REVENUE' },
    { code: '4-9000', name: 'Pendapatan Lain-lain', type: 'REVENUE' },
    { code: '5-1000', name: 'Harga Pokok Penjualan', type: 'COST' },
    { code: '5-1200', name: 'Retur Pembelian', type: 'COST' },
    { code: '5-1300', name: 'Selisih Stok', type: 'COST' },
    { code: '6-1000', name: 'Beban Gaji', type: 'EXPENSE' },
    { code: '6-1100', name: 'Beban Sewa', type: 'EXPENSE' },
    { code: '6-1200', name: 'Beban Listrik, Air & Telepon', type: 'EXPENSE' },
    { code: '6-1300', name: 'Beban Pengiriman', type: 'EXPENSE' },
    { code: '6-1400', name: 'Beban Penyusutan', type: 'EXPENSE' },
    { code: '6-9000', name: 'Beban Lain-lain', type: 'EXPENSE' },
];
const SETTINGS = {
    cash: '1-1100', inventory: '1-1400', receivable: '1-1300', payable: '2-1100',
    sales: '4-1000', salesDiscount: '4-1100', cogs: '5-1000', salesReturn: '4-1200',
    purchaseReturn: '5-1200', vatOut: '2-1200', vatIn: '1-1500', custDeposit: '2-1300',
    suppDeposit: '1-1600', shipping: '6-1300', stockDiff: '5-1300', retained: '3-2000',
    currentProfit: '3-3000', otherIncome: '4-9000', otherExpense: '6-9000',
};
async function seedAccounting(prisma) {
    const [{ ok }] = await prisma.$queryRaw `SELECT to_regclass('public."AccountSettings"') IS NOT NULL AS ok`;
    if (!ok)
        throw new Error('Tabel AccountSettings belum ada. Jalankan dulu: npx prisma migrate deploy');
    const types = await prisma.accountType.findMany();
    const typeId = new Map(types.map((t) => [t.Code, t.ID]));
    if (typeId.size === 0)
        throw new Error('AccountTypes belum ada — jalankan prisma/seed.ts dulu');
    const idByCode = new Map();
    for (const r of COA) {
        const acc = await prisma.account.upsert({
            where: { Code: r.code },
            create: { Code: r.code, Name: r.name, TypeID: typeId.get(r.type), ParentID: r.parent ? idByCode.get(r.parent) : null },
            update: {},
        });
        idByCode.set(r.code, acc.ID);
    }
    console.log(`✓ Daftar Perkiraan seeded (${COA.length} akun)`);
    for (const [key, code] of Object.entries(SETTINGS)) {
        const existing = await prisma.accountSetting.findUnique({ where: { Key: key } });
        if (existing?.AccountID)
            continue;
        await prisma.accountSetting.upsert({
            where: { Key: key },
            create: { Key: key, AccountID: idByCode.get(code) },
            update: { AccountID: idByCode.get(code) },
        });
    }
    console.log(`✓ Setting Perkiraan seeded (${Object.keys(SETTINGS).length} kunci)`);
}
if (require.main === module) {
    (async () => {
        await Promise.resolve().then(() => __importStar(require('dotenv/config')));
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('.prisma/client')));
        const { PrismaPg } = await Promise.resolve().then(() => __importStar(require('@prisma/adapter-pg')));
        const { Pool } = await Promise.resolve().then(() => __importStar(require('pg')));
        const prisma = new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })) });
        try {
            await seedAccounting(prisma);
        }
        finally {
            await prisma.$disconnect();
        }
    })().catch((e) => { console.error(e); process.exit(1); });
}
