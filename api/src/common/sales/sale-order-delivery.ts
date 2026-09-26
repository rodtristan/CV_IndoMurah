// ================================================================
// sale-order-delivery.ts — "Jml Kirim" & "Status Proses" Pesanan Penjualan
// ================================================================
// Jumlah kirim tiap item pesanan = Σ jumlah pada penjualan (tidak batal) yang
// merujuk pesanan tsb, dicocokkan per produk + satuan (dialokasikan berurutan
// bila produk yang sama ada di beberapa baris). Status Proses:
//   OPEN    → belum ada yang dikirim / dijual
//   PARTIAL → sebagian
//   DONE    → semua item terpenuhi
// Dipanggil setiap penjualan dengan SaleOrderID dibuat / diubah / dibatalkan / dihapus.
// ================================================================

import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

export async function recalcSaleOrderDelivery(tx: Tx, saleOrderId: number | null | undefined): Promise<void> {
  if (!saleOrderId) return;
  const so = await tx.saleOrder.findUnique({ where: { ID: saleOrderId }, include: { SaleOrderItems: { orderBy: { ID: 'asc' } } } });
  if (!so) return;

  const sales = await tx.sale.findMany({
    where: { SaleOrderID: saleOrderId, PaymentStatus: { Code: { not: 'CANCELLED' } } },
    select: { SaleItems: { select: { ProductID: true, UnitID: true, Quantity: true } } },
  });
  const pool = new Map<string, number>();
  for (const s of sales) {
    for (const it of s.SaleItems) {
      const k = `${it.ProductID}:${it.UnitID}`;
      pool.set(k, (pool.get(k) ?? 0) + Number(it.Quantity));
    }
  }

  let ordered = 0;
  let delivered = 0;
  for (const item of so.SaleOrderItems) {
    const k = `${item.ProductID}:${item.UnitID}`;
    const qty = Number(item.Quantity);
    const got = Math.min(qty, pool.get(k) ?? 0);
    pool.set(k, (pool.get(k) ?? 0) - got);
    ordered += qty;
    delivered += got;
    if (Math.abs(got - Number(item.DeliveredQuantity)) > 0.0005) {
      await tx.saleOrderItem.update({ where: { ID: item.ID }, data: { DeliveredQuantity: new Prisma.Decimal(got) } });
    }
  }
  const status = delivered <= 0.0005 ? 'OPEN' : delivered + 0.0005 >= ordered ? 'DONE' : 'PARTIAL';
  await tx.saleOrder.update({
    where: { ID: saleOrderId },
    data: { OrderedQty: new Prisma.Decimal(ordered), DeliveredQty: new Prisma.Decimal(delivered), ProcessStatus: status },
  });
}
