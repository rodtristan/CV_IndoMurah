"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPORT_MAP = exports.REPORT_PROVIDERS = void 0;
const master_1 = require("./providers/master");
const purchase_1 = require("./providers/purchase");
const sale_1 = require("./providers/sale");
const debt_1 = require("./providers/debt");
const stock_1 = require("./providers/stock");
const finance_1 = require("./providers/finance");
const byGroup = (g) => finance_1.financeProviders.filter((p) => p.group === g);
exports.REPORT_PROVIDERS = [
    ...master_1.masterProviders,
    ...purchase_1.purchaseProviders,
    ...sale_1.saleProviders,
    ...debt_1.debtProviders,
    ...debt_1.receivableProviders,
    ...stock_1.stockProviders,
    ...byGroup('Kas'),
    ...sale_1.profitProviders,
    ...byGroup('Jurnal'),
    ...byGroup('Buku Besar'),
    ...byGroup('Keuangan'),
    ...byGroup('Daftar Perkiraan'),
];
exports.REPORT_MAP = new Map(exports.REPORT_PROVIDERS.map((p) => [p.key, p]));
