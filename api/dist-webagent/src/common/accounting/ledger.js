"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openingRowsWhere = exports.CLOSING_REF = exports.OPENING_REF = void 0;
exports.ledgerJournalWhere = ledgerJournalWhere;
exports.accountBalances = accountBalances;
exports.OPENING_REF = 'OPENING_BALANCE';
exports.CLOSING_REF = 'YEAR_CLOSE';
function ledgerJournalWhere(opts = {}) {
    const date = {};
    if (opts.from)
        date.gte = opts.from;
    if (opts.to)
        date.lte = opts.to;
    return {
        ...(opts.includeDraft ? {} : { IsPosted: true }),
        ...(Object.keys(date).length ? { Date: date } : {}),
        OR: [{ ReferenceType: null }, { ReferenceType: { not: exports.OPENING_REF } }],
    };
}
const openingRowsWhere = (date) => ({
    Type: 'ACCOUNT',
    AccountID: { not: null },
    ...(date && Object.keys(date).length ? { Date: date } : {}),
    OR: [{ Notes: null }, { Notes: { not: { startsWith: 'Opening Balance FY ' } } }],
});
exports.openingRowsWhere = openingRowsWhere;
async function accountBalances(prisma, asOf) {
    const [lines, obs, accounts] = await Promise.all([
        prisma.journalEntryLine.groupBy({
            by: ['AccountID'],
            where: { JournalEntry: { Journal: ledgerJournalWhere({ to: asOf }) } },
            _sum: { Debit: true, Credit: true },
        }),
        prisma.openingBalance.groupBy({
            by: ['AccountID'],
            where: (0, exports.openingRowsWhere)(asOf ? { lte: asOf } : undefined),
            _sum: { Debit: true, Credit: true },
        }),
        prisma.account.findMany({ select: { ID: true, Type: { select: { IsDebitNormal: true } } } }),
    ]);
    const normal = new Map(accounts.map((a) => [a.ID, a.Type?.IsDebitNormal ?? true]));
    const out = new Map();
    const add = (id, d, c) => {
        if (!id)
            return;
        const e = out.get(id) ?? { accountId: id, debit: 0, credit: 0, balance: 0 };
        e.debit += Number(d ?? 0);
        e.credit += Number(c ?? 0);
        out.set(id, e);
    };
    for (const l of lines)
        add(l.AccountID, l._sum.Debit, l._sum.Credit);
    for (const o of obs)
        add(o.AccountID, o._sum.Debit, o._sum.Credit);
    for (const e of out.values()) {
        e.debit = Math.round(e.debit * 100) / 100;
        e.credit = Math.round(e.credit * 100) / 100;
        e.balance = Math.round(((normal.get(e.accountId) ?? true) ? e.debit - e.credit : e.credit - e.debit) * 100) / 100;
    }
    return out;
}
