// ================================================================
// party-balance.service.ts — Piutang pelanggan & hutang supplier
// ================================================================
//
// Customer.TotalReceivable dan Supplier.TotalDebt adalah angka turunan
// (cache) yang SELALU dihitung ulang dari dokumen, bukan di-increment:
//
//   sisa per faktur = Total − retur aktif − pembayaran yang sudah cair (IsCleared)
//   (minimal 0; faktur berstatus CANCELLED diabaikan)
//
// Status pembayaran faktur juga memperhitungkan retur: faktur yang sisa
// tagihannya 0 karena retur dianggap lunas (PAID).
// Modul pembayaran sebaiknya memanggil recalcSale/recalcPurchase +
// recalcCustomer/recalcSupplier setelah mencatat pembayaran.
// ================================================================

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma-service';

type Tx = Prisma.TransactionClient | PrismaService;
const n = (v: unknown) => Number(v ?? 0);
const r2 = (v: number) => Math.round(v * 100) / 100;
const isCancelled = (code?: string | null) => (code ?? '').toUpperCase() === 'CANCELLED';

@Injectable()
export class PartyBalanceService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Penjualan ─────────────────────────────────────────────────────────

  /** Sisa tagihan satu faktur penjualan (setelah retur & pembayaran cair). */
  async saleOutstanding(tx: Tx, saleId: number) {
    const s = await tx.sale.findUnique({
      where: { ID: saleId },
      include: {
        PaymentStatus: { select: { Code: true } },
        SalePayments: { select: { Amount: true, IsCleared: true } },
        SaleReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } },
      },
    });
    if (!s) return null;
    const returns = s.SaleReturns.filter((r) => !isCancelled(r.Status?.Code)).reduce((a, r) => a + n(r.TotalReturn), 0);
    const paid = s.SalePayments.filter((p) => p.IsCleared).reduce((a, p) => a + n(p.Amount), 0);
    const committed = s.SalePayments.reduce((a, p) => a + n(p.Amount), 0);
    const total = n(s.Total);
    return {
      total,
      returns: r2(returns),
      paid: r2(paid),
      committed: r2(committed),
      remaining: r2(Math.max(total - returns - paid, 0)),
      cancelled: isCancelled(s.PaymentStatus?.Code),
      customerId: s.CustomerID,
    };
  }

  /** Hitung ulang PaymentStatus faktur penjualan dengan memperhitungkan retur. */
  async recalcSale(tx: Tx, saleId: number) {
    const o = await this.saleOutstanding(tx, saleId);
    if (!o || o.cancelled) return o;
    const effective = r2(o.total - o.returns);
    const code = effective <= 0.005 || o.paid >= effective - 0.005 ? 'PAID' : o.paid > 0 ? 'PARTIAL' : 'PENDING';
    const st = await tx.paymentStatus.findUnique({ where: { Code: code }, select: { ID: true } });
    if (st) await tx.sale.update({ where: { ID: saleId }, data: { PaymentStatusID: st.ID } });
    return o;
  }

  /** Total piutang berjalan pelanggan (semua faktur non-batal). */
  async customerOutstanding(tx: Tx, customerId: number, excludeSaleId?: number) {
    const sales = await tx.sale.findMany({
      where: { CustomerID: customerId, NOT: [{ PaymentStatus: { Code: 'CANCELLED' } }, ...(excludeSaleId ? [{ ID: excludeSaleId }] : [])] },
      select: {
        Total: true,
        SalePayments: { select: { Amount: true, IsCleared: true } },
        SaleReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } },
      },
    });
    let sum = 0;
    for (const s of sales) {
      const ret = s.SaleReturns.filter((r) => !isCancelled(r.Status?.Code)).reduce((a, r) => a + n(r.TotalReturn), 0);
      const paid = s.SalePayments.filter((p) => p.IsCleared).reduce((a, p) => a + n(p.Amount), 0);
      sum += Math.max(n(s.Total) - ret - paid, 0);
    }
    return r2(sum);
  }

  async recalcCustomer(tx: Tx, customerId: number) {
    const total = await this.customerOutstanding(tx, customerId);
    await tx.customer.update({ where: { ID: customerId }, data: { TotalReceivable: new Prisma.Decimal(total) } });
    return total;
  }

  // ─── Pembelian ─────────────────────────────────────────────────────────

  /** Hitung ulang Paid/Remaining/PaymentStatus faktur pembelian (retur mengurangi sisa). */
  async recalcPurchase(tx: Tx, purchaseId: number) {
    const p = await tx.purchase.findUnique({
      where: { ID: purchaseId },
      include: {
        Status: { select: { Code: true } },
        PaymentStatus: { select: { Code: true } },
        PurchasePayments: { select: { Amount: true, IsCleared: true } },
        PurchaseReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } },
      },
    });
    if (!p) return null;
    const returns = p.PurchaseReturns.filter((r) => !isCancelled(r.Status?.Code)).reduce((a, r) => a + n(r.TotalReturn), 0);
    const paid = p.PurchasePayments.filter((x) => x.IsCleared).reduce((a, x) => a + n(x.Amount), 0);
    const effective = r2(n(p.Total) - returns);
    const remaining = r2(Math.max(effective - paid, 0));
    const data: Prisma.PurchaseUpdateInput = { Paid: new Prisma.Decimal(r2(paid)), Remaining: new Prisma.Decimal(remaining) };
    if (!isCancelled(p.Status?.Code) && !isCancelled(p.PaymentStatus?.Code)) {
      const code = effective <= 0.005 || paid >= effective - 0.005 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING';
      const st = await tx.paymentStatus.findUnique({ where: { Code: code }, select: { ID: true } });
      if (st) data.PaymentStatus = { connect: { ID: st.ID } };
    }
    await tx.purchase.update({ where: { ID: purchaseId }, data });
    return { total: n(p.Total), returns: r2(returns), paid: r2(paid), remaining, supplierId: p.SupplierID };
  }

  async supplierOutstanding(tx: Tx, supplierId: number) {
    const rows = await tx.purchase.findMany({
      where: { SupplierID: supplierId, NOT: [{ Status: { Code: 'CANCELLED' } }, { PaymentStatus: { Code: 'CANCELLED' } }] },
      select: {
        Total: true,
        PurchasePayments: { select: { Amount: true, IsCleared: true } },
        PurchaseReturns: { select: { TotalReturn: true, Status: { select: { Code: true } } } },
      },
    });
    let sum = 0;
    for (const p of rows) {
      const ret = p.PurchaseReturns.filter((r) => !isCancelled(r.Status?.Code)).reduce((a, r) => a + n(r.TotalReturn), 0);
      const paid = p.PurchasePayments.filter((x) => x.IsCleared).reduce((a, x) => a + n(x.Amount), 0);
      sum += Math.max(n(p.Total) - ret - paid, 0);
    }
    return r2(sum);
  }

  async recalcSupplier(tx: Tx, supplierId: number) {
    const total = await this.supplierOutstanding(tx, supplierId);
    await tx.supplier.update({ where: { ID: supplierId }, data: { TotalDebt: new Prisma.Decimal(total) } });
    return total;
  }
}
