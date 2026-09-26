// ================================================================
// points.ts — Point Penjualan (Setting Point Pelanggan)
// ================================================================
// Point faktur dihitung saat penjualan disimpan dan disimpan di Sale.PointEarned:
//   - Setting aktif & Jenis Point ≠ "Tidak memakai point"
//   - tanggal faktur di dalam periode point (bila diisi)
//   - pelanggan umum (UMUM / WALKIN) hanya dapat point bila "Non Member dapat point"
//   - total ≥ minimal transaksi
//   - 1 point per kelipatan faktur (InvoiceMultiple) — atau Total × PointsPerRupiah bila kelipatan 0
// Saldo point pelanggan = PointOpening + Σ point faktur tidak batal − Σ ambil point.
// ================================================================

import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

const NON_MEMBER_CODES = ['UMUM', 'WALKIN'];

export async function computeSalePoints(tx: Tx, customerId: number, total: number, date: Date): Promise<number> {
  const setting = await tx.pointSetting.findFirst({ where: { IsActive: true }, orderBy: { ID: 'asc' } });
  if (!setting || setting.PointType === 'NONE') return 0;
  if (setting.PeriodFrom && date < setting.PeriodFrom) return 0;
  if (setting.PeriodTo) {
    const end = new Date(setting.PeriodTo);
    end.setUTCHours(23, 59, 59, 999);
    if (date > end) return 0;
  }
  if (total < Number(setting.MinimumTransaction)) return 0;
  const customer = await tx.customer.findUnique({ where: { ID: customerId }, select: { Code: true } });
  if (!customer) return 0;
  if (!setting.NonMemberEarns && NON_MEMBER_CODES.includes(customer.Code.toUpperCase())) return 0;
  const multiple = Number(setting.InvoiceMultiple);
  const pts = multiple > 0 ? Math.floor(total / multiple) : Math.floor(total * Number(setting.PointsPerRupiah));
  return Math.max(pts, 0);
}

/** Hitung ulang Customer.PointBalance dari saldo awal, point faktur dan pengambilan point. */
export async function recalcCustomerPoints(tx: Tx, customerId: number): Promise<number> {
  const c = await tx.customer.findUnique({ where: { ID: customerId }, select: { PointOpening: true } });
  if (!c) return 0;
  const [earned, redeemed] = await Promise.all([
    tx.sale.aggregate({
      where: { CustomerID: customerId, PaymentStatus: { Code: { not: 'CANCELLED' } } },
      _sum: { PointEarned: true },
    }),
    tx.pointRedemption.aggregate({ where: { CustomerID: customerId }, _sum: { PointsRedeemed: true } }),
  ]);
  const balance = Math.floor(c.PointOpening + Number(earned._sum.PointEarned ?? 0) - Number(redeemed._sum.PointsRedeemed ?? 0));
  await tx.customer.update({ where: { ID: customerId }, data: { PointBalance: balance } });
  return balance;
}
