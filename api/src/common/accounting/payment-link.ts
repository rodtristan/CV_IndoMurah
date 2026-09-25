import { Prisma } from '@prisma/client';
import { Tx } from './auto-journal.service';

/**
 * Cek/BG payments (SalePayment / PurchasePayment with InstrumentType CEK|BG) are mirrored by a ChequePayment row
 * (ReferenceType SALE_PAYMENT|PURCHASE_PAYMENT, ReferenceID = payment ID) so the "Status Cek/Giro" screens show them.
 * The payment row is the source of truth for journals: the linked ChequePayment never posts on its own.
 */
export type PaymentRefType = 'SALE_PAYMENT' | 'PURCHASE_PAYMENT';

export const isChequeInstrument = (i?: string | null) => i === 'CEK' || i === 'BG';

async function nextChequeCode(tx: Tx, type: 'SALE' | 'PURCHASE') {
  const d = new Date();
  const prefix = `${type === 'SALE' ? 'CHQ-S' : 'CHQ-P'}-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  const last = await tx.chequePayment.findFirst({ where: { Code: { startsWith: prefix } }, orderBy: { Code: 'desc' }, select: { Code: true } });
  const n = last ? parseInt(last.Code.split('-').pop() || '0', 10) + 1 : 1;
  return `${prefix}-${String(n).padStart(4, '0')}`;
}

/** Create / update / remove the ChequePayment mirror of a payment after it was written. */
export async function syncChequeMirror(
  tx: Tx,
  refType: PaymentRefType,
  p: { ID: number; InstrumentType: string; ReferenceNumber: string | null; Date: Date; DueDate: Date | null; Amount: Prisma.Decimal; IsCleared: boolean; ClearedAt: Date | null; Notes?: string | null },
) {
  const linked = await tx.chequePayment.findMany({ where: { ReferenceType: refType, ReferenceID: p.ID, Status: { in: ['PENDING', 'CLEARED'] } } });
  if (!isChequeInstrument(p.InstrumentType)) {
    if (linked.length) await tx.chequePayment.deleteMany({ where: { ID: { in: linked.map((c) => c.ID) } } });
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
    if (linked.length > 1) await tx.chequePayment.deleteMany({ where: { ID: { in: linked.slice(1).map((c) => c.ID) } } });
    return;
  }
  const type = refType === 'SALE_PAYMENT' ? 'SALE' : 'PURCHASE';
  await tx.chequePayment.create({
    data: { ...data, Code: await nextChequeCode(tx, type), Type: type, ReferenceType: refType, ReferenceID: p.ID, Notes: p.Notes ?? null },
  });
}

/** PaymentMethod used for "bayar dengan deposit" (created on first use). */
export async function ensureDepositMethod(tx: Tx) {
  const m = await tx.paymentMethod.findUnique({ where: { Code: 'DEPOSIT' } });
  if (m) return m;
  return tx.paymentMethod.create({ data: { Code: 'DEPOSIT', Name: 'Deposit', Type: 'DEPOSIT', Description: 'Pembayaran memakai saldo deposit', SortOrder: 99 } });
}
