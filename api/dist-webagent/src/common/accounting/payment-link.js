"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChequeInstrument = void 0;
exports.syncChequeMirror = syncChequeMirror;
exports.ensureDepositMethod = ensureDepositMethod;
const isChequeInstrument = (i) => i === 'CEK' || i === 'BG';
exports.isChequeInstrument = isChequeInstrument;
async function nextChequeCode(tx, type) {
    const d = new Date();
    const prefix = `${type === 'SALE' ? 'CHQ-S' : 'CHQ-P'}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const last = await tx.chequePayment.findFirst({ where: { Code: { startsWith: prefix } }, orderBy: { Code: 'desc' }, select: { Code: true } });
    const n = last ? parseInt(last.Code.split('-').pop() || '0', 10) + 1 : 1;
    return `${prefix}-${String(n).padStart(4, '0')}`;
}
async function syncChequeMirror(tx, refType, p) {
    const linked = await tx.chequePayment.findMany({ where: { ReferenceType: refType, ReferenceID: p.ID, Status: { in: ['PENDING', 'CLEARED'] } } });
    if (!(0, exports.isChequeInstrument)(p.InstrumentType)) {
        if (linked.length)
            await tx.chequePayment.deleteMany({ where: { ID: { in: linked.map((c) => c.ID) } } });
        return;
    }
    const data = {
        ChequeNumber: p.ReferenceNumber || '-',
        ChequeDate: p.Date,
        DueDate: p.DueDate,
        Amount: p.Amount,
        Status: p.IsCleared ? 'CLEARED' : 'PENDING',
        ClearedDate: p.IsCleared ? p.ClearedAt ?? new Date() : null,
    };
    if (linked.length) {
        await tx.chequePayment.update({ where: { ID: linked[0].ID }, data });
        if (linked.length > 1)
            await tx.chequePayment.deleteMany({ where: { ID: { in: linked.slice(1).map((c) => c.ID) } } });
        return;
    }
    const type = refType === 'SALE_PAYMENT' ? 'SALE' : 'PURCHASE';
    await tx.chequePayment.create({
        data: { ...data, Code: await nextChequeCode(tx, type), Type: type, ReferenceType: refType, ReferenceID: p.ID, Notes: p.Notes ?? null },
    });
}
async function ensureDepositMethod(tx) {
    const m = await tx.paymentMethod.findUnique({ where: { Code: 'DEPOSIT' } });
    if (m)
        return m;
    return tx.paymentMethod.create({ data: { Code: 'DEPOSIT', Name: 'Deposit', Type: 'DEPOSIT', Description: 'Pembayaran memakai saldo deposit', SortOrder: 99 } });
}
