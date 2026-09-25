import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Tx } from './auto-journal.service';

export type DepositKind = 'IN' | 'OUT' | 'USE';

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
const dec = (n: number) => new Prisma.Decimal(r2(n).toFixed(2));

/**
 * Deposit direction from the row. Code prefixes (used by the web): customer DPIN/DPOUT/DPUSE,
 * supplier DBIN/DBOUT/DBUSE. CustomerDeposit.Type (DEPOSIT/WITHDRAW/USAGE) wins when set.
 */
export function depositKind(code: string, type?: string | null): DepositKind {
  const t = (type ?? '').toUpperCase();
  if (t === 'WITHDRAW' || t === 'WITHDRAWAL' || t === 'REFUND') return 'OUT';
  if (t === 'USAGE' || t === 'USE') return 'USE';
  const c = (code ?? '').toUpperCase();
  if (c.startsWith('DPOUT') || c.startsWith('DBOUT')) return 'OUT';
  if (c.startsWith('DPUSE') || c.startsWith('DBUSE')) return 'USE';
  return 'IN';
}

export const customerUsageCode = (salePaymentId: number) => `DPUSE-SP${salePaymentId}`;
export const supplierUsageCode = (purchasePaymentId: number) => `DBUSE-PP${purchasePaymentId}`;

/**
 * Keeps deposit balances consistent:
 *  - CustomerDeposit/SupplierDeposit rows of kind IN carry RemainingAmount (FIFO after withdrawals and usage);
 *    OUT/USE rows have RemainingAmount 0.
 *  - Customer.DepositBalance = Σ IN − Σ OUT − Σ USE.
 * Usage by a payment is stored as a USE row (code DPUSE-SP<paymentId> / DBUSE-PP<paymentId>).
 */
@Injectable()
export class DepositLedgerService {
  private allocate(rows: { ID: number; Code: string; Type?: string | null; Amount: Prisma.Decimal }[]) {
    const kinds = rows.map((r) => ({ r, k: depositKind(r.Code, r.Type) }));
    const totalIn = kinds.filter((x) => x.k === 'IN').reduce((s, x) => s + Number(x.r.Amount), 0);
    const consumed = kinds.filter((x) => x.k !== 'IN').reduce((s, x) => s + Number(x.r.Amount), 0);
    let left = consumed;
    const remaining = new Map<number, number>();
    for (const x of kinds) {
      if (x.k !== 'IN') { remaining.set(x.r.ID, 0); continue; }
      const take = Math.min(Number(x.r.Amount), left);
      left = r2(left - take);
      remaining.set(x.r.ID, r2(Number(x.r.Amount) - take));
    }
    return { balance: r2(totalIn - consumed), remaining };
  }

  async customerBalance(tx: Tx, customerId: number) {
    const rows = await tx.customerDeposit.findMany({ where: { CustomerID: customerId }, orderBy: [{ Date: 'asc' }, { ID: 'asc' }] });
    return this.allocate(rows).balance;
  }

  async supplierBalance(tx: Tx, supplierId: number) {
    const rows = await tx.supplierDeposit.findMany({ where: { SupplierID: supplierId }, orderBy: [{ Date: 'asc' }, { ID: 'asc' }] });
    return this.allocate(rows).balance;
  }

  /** Recompute RemainingAmount + Customer.DepositBalance. Throws 400 when the balance would go negative. */
  async recomputeCustomer(tx: Tx, customerId: number) {
    const rows = await tx.customerDeposit.findMany({ where: { CustomerID: customerId }, orderBy: [{ Date: 'asc' }, { ID: 'asc' }] });
    const { balance, remaining } = this.allocate(rows);
    if (balance < -0.004) throw new BadRequestException(`Saldo deposit pelanggan tidak mencukupi (saldo menjadi ${balance})`);
    for (const r of rows) {
      const v = remaining.get(r.ID) ?? 0;
      if (Number(r.RemainingAmount) !== v) await tx.customerDeposit.update({ where: { ID: r.ID }, data: { RemainingAmount: dec(v) } });
    }
    await tx.customer.update({ where: { ID: customerId }, data: { DepositBalance: dec(balance) } });
    return balance;
  }

  /** Recompute SupplierDeposit.RemainingAmount (Supplier has no balance column). */
  async recomputeSupplier(tx: Tx, supplierId: number) {
    const rows = await tx.supplierDeposit.findMany({ where: { SupplierID: supplierId }, orderBy: [{ Date: 'asc' }, { ID: 'asc' }] });
    const { balance, remaining } = this.allocate(rows);
    if (balance < -0.004) throw new BadRequestException(`Saldo deposit supplier tidak mencukupi (saldo menjadi ${balance})`);
    for (const r of rows) {
      const v = remaining.get(r.ID) ?? 0;
      if (Number(r.RemainingAmount) !== v) await tx.supplierDeposit.update({ where: { ID: r.ID }, data: { RemainingAmount: dec(v) } });
    }
    return balance;
  }

  /** Record (or replace) the deposit usage row of a sale payment. */
  async useCustomerDeposit(tx: Tx, p: { customerId: number; salePaymentId: number; amount: number; date: Date; userId: string; note: string }) {
    const code = customerUsageCode(p.salePaymentId);
    await tx.customerDeposit.deleteMany({ where: { Code: code } });
    await tx.customerDeposit.create({
      data: {
        Code: code, Date: p.date, CustomerID: p.customerId, Amount: dec(p.amount), RemainingAmount: dec(0),
        Type: 'USAGE', ReferenceNumber: `SALE_PAYMENT:${p.salePaymentId}`, Description: p.note, CreatedByID: p.userId,
      },
    });
    return this.recomputeCustomer(tx, p.customerId);
  }

  async releaseCustomerDeposit(tx: Tx, salePaymentId: number) {
    const row = await tx.customerDeposit.findUnique({ where: { Code: customerUsageCode(salePaymentId) } });
    if (!row) return;
    await tx.customerDeposit.delete({ where: { ID: row.ID } });
    await this.recomputeCustomer(tx, row.CustomerID);
  }

  async useSupplierDeposit(tx: Tx, p: { supplierId: number; purchasePaymentId: number; amount: number; date: Date; userId: string; note: string }) {
    const code = supplierUsageCode(p.purchasePaymentId);
    await tx.supplierDeposit.deleteMany({ where: { Code: code } });
    await tx.supplierDeposit.create({
      data: { Code: code, Date: p.date, SupplierID: p.supplierId, Amount: dec(p.amount), RemainingAmount: dec(0), Description: p.note, CreatedByID: p.userId },
    });
    return this.recomputeSupplier(tx, p.supplierId);
  }

  async releaseSupplierDeposit(tx: Tx, purchasePaymentId: number) {
    const row = await tx.supplierDeposit.findUnique({ where: { Code: supplierUsageCode(purchasePaymentId) } });
    if (!row) return;
    await tx.supplierDeposit.delete({ where: { ID: row.ID } });
    await this.recomputeSupplier(tx, row.SupplierID);
  }
}
