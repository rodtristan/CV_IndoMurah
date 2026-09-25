import { PrismaService } from '../prisma/prisma-service';

/**
 * Single definition of "what is in the ledger", shared by account balances and finance reports:
 *  - posted Journal lines, EXCEPT journals of ReferenceType OPENING_BALANCE, plus
 *  - OpeningBalance rows of Type ACCOUNT (read directly; the OPENING_BALANCE journal mirrors them).
 * So opening balances are counted exactly once.
 */
export const OPENING_REF = 'OPENING_BALANCE';
export const CLOSING_REF = 'YEAR_CLOSE';

/** Prisma `where` for Journal rows that belong to the ledger (NULL-safe exclusion of OPENING_BALANCE). */
export function ledgerJournalWhere(opts: { from?: Date; to?: Date; includeDraft?: boolean } = {}) {
  const date: any = {};
  if (opts.from) date.gte = opts.from;
  if (opts.to) date.lte = opts.to;
  return {
    ...(opts.includeDraft ? {} : { IsPosted: true }),
    ...(Object.keys(date).length ? { Date: date } : {}),
    OR: [{ ReferenceType: null }, { ReferenceType: { not: OPENING_REF } }],
  };
}

/**
 * OpeningBalance ACCOUNT rows that belong to the ledger. Rows written by the retired
 * business-logic year-close ("Opening Balance FY <year>") only duplicated balances already carried by
 * the journals, so they are ignored.
 */
export const openingRowsWhere = (date?: { gte?: Date; lte?: Date }) => ({
  Type: 'ACCOUNT',
  AccountID: { not: null },
  ...(date && Object.keys(date).length ? { Date: date } : {}),
  OR: [{ Notes: null }, { Notes: { not: { startsWith: 'Opening Balance FY ' } } }],
});

export interface AccountBalance { accountId: number; debit: number; credit: number; balance: number }

/** Balance per account (natural sign: debit-normal = D − K, otherwise K − D) as of a date. */
export async function accountBalances(prisma: PrismaService, asOf?: Date): Promise<Map<number, AccountBalance>> {
  const [lines, obs, accounts] = await Promise.all([
    prisma.journalEntryLine.groupBy({
      by: ['AccountID'],
      where: { JournalEntry: { Journal: ledgerJournalWhere({ to: asOf }) } },
      _sum: { Debit: true, Credit: true },
    }),
    prisma.openingBalance.groupBy({
      by: ['AccountID'],
      where: openingRowsWhere(asOf ? { lte: asOf } : undefined) as any,
      _sum: { Debit: true, Credit: true },
    }),
    prisma.account.findMany({ select: { ID: true, Type: { select: { IsDebitNormal: true } } } }),
  ]);
  const normal = new Map(accounts.map((a) => [a.ID, a.Type?.IsDebitNormal ?? true]));
  const out = new Map<number, AccountBalance>();
  const add = (id: number | null, d: any, c: any) => {
    if (!id) return;
    const e = out.get(id) ?? { accountId: id, debit: 0, credit: 0, balance: 0 };
    e.debit += Number(d ?? 0);
    e.credit += Number(c ?? 0);
    out.set(id, e);
  };
  for (const l of lines) add(l.AccountID, l._sum.Debit, l._sum.Credit);
  for (const o of obs) add(o.AccountID, o._sum.Debit, o._sum.Credit);
  for (const e of out.values()) {
    e.debit = Math.round(e.debit * 100) / 100;
    e.credit = Math.round(e.credit * 100) / 100;
    e.balance = Math.round(((normal.get(e.accountId) ?? true) ? e.debit - e.credit : e.credit - e.debit) * 100) / 100;
  }
  return out;
}
