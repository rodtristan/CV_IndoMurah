// ================================================================
// purchase-order-receipt.ts — "Jml Terima" & "Status Proses" Pesanan Pembelian
// ================================================================
// Jumlah terima tiap item pesanan = Σ jumlah pada pembelian (tidak batal) yang
// merujuk pesanan tsb, dicocokkan per produk + satuan (dialokasikan berurutan
// bila produk yang sama ada di beberapa baris). Status Proses:
//   OPEN    → belum ada yang diterima
//   PARTIAL → sebagian diterima
//   DONE    → semua item diterima penuh
// Dipanggil setiap pembelian dengan PurchaseOrderID dibuat / diubah / dihapus.
// ================================================================

import { Prisma } from '@prisma/client';

type Tx = Prisma.TransactionClient;

export async function recalcPurchaseOrderReceipt(tx: Tx, purchaseOrderId: number | null | undefined): Promise<void> {
  if (!purchaseOrderId) return;
  const po = await tx.purchaseOrder.findUnique({ where: { ID: purchaseOrderId }, include: { PurchaseOrderItems: { orderBy: { ID: 'asc' } } } });
  if (!po) return;

  const purchases = await tx.purchase.findMany({
    where: { PurchaseOrderID: purchaseOrderId, Status: { Code: { not: 'CANCELLED' } } },
    select: { PurchaseItems: { select: { ProductID: true, UnitID: true, Quantity: true } } },
  });
  const pool = new Map<string, number>();
  for (const p of purchases) {
    for (const it of p.PurchaseItems) {
      const k = `${it.ProductID}:${it.UnitID}`;
      pool.set(k, (pool.get(k) ?? 0) + Number(it.Quantity));
    }
  }

  let ordered = 0;
  let received = 0;
  for (const item of po.PurchaseOrderItems) {
    const k = `${item.ProductID}:${item.UnitID}`;
    const qty = Number(item.Quantity);
    const got = Math.min(qty, pool.get(k) ?? 0);
    pool.set(k, (pool.get(k) ?? 0) - got);
    ordered += qty;
    received += got;
    if (Math.abs(got - Number(item.ReceivedQuantity)) > 0.0005) {
      await tx.purchaseOrderItem.update({ where: { ID: item.ID }, data: { ReceivedQuantity: new Prisma.Decimal(got) } });
    }
  }
  const status = received <= 0.0005 ? 'OPEN' : received + 0.0005 >= ordered ? 'DONE' : 'PARTIAL';
  await tx.purchaseOrder.update({
    where: { ID: purchaseOrderId },
    data: { OrderedQty: new Prisma.Decimal(ordered), ReceivedQty: new Prisma.Decimal(received), ProcessStatus: status },
  });
}
