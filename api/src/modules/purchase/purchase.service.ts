import { recalcPurchaseOrderReceipt } from '../../common/stock/purchase-order-receipt';
import { computeDocTotals, inventoryFactor } from '../../common/accounting/doc-totals';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { NotificationService } from '../notification/notification.service';
import { StockLedgerService } from '../../common/stock/stock-ledger.service';
import { PartyBalanceService } from '../../common/stock/party-balance.service';
import { AutoJournalService } from '../../common/accounting/auto-journal.service';
import { Prisma } from '@prisma/client';
import { CreatePurchaseDto, CreatePurchaseItemDto, UpdatePurchaseDto, UpdateStatusDto } from './dto/purchase.dto';

type Tx = Prisma.TransactionClient;
const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

/**
 * Pembelian (faktur pembelian = barang diterima).
 * Stok MASUK saat faktur disimpan (status DRAFT pun sudah final secara stok, sama seperti
 * Ketoko: pembayaran/DP langsung dicatat pada faktur baru), dibalik saat CANCELLED atau dihapus.
 * HPP produk (Product.PurchasePrice) = rata-rata tertimbang; harga masuk per satuan dasar =
 * subtotal baris setelah diskon baris & pro-rata diskon faktur (tanpa PPN) / qty satuan dasar.
 */
@Injectable()
export class PurchaseService {
  private readonly CACHE_PREFIX = 'purchases';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
    private notificationService: NotificationService,
    private ledger: StockLedgerService,
    private party: PartyBalanceService,
    private journal: AutoJournalService,
  ) {}

  async findAll(query: Record<string, any>) {
    const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          searchableFields: ['*'],
          allowedIncludes: ['*'],
          defaultOrderBy: { CreatedAt: 'desc' },
        });

        const findArgs: any = {
          where: prismaQuery.where,
          orderBy: prismaQuery.orderBy,
          skip: prismaQuery.skip,
          take: prismaQuery.take,
        };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const [data, total] = await Promise.all([
          this.prisma.purchase.findMany(findArgs),
          this.prisma.purchase.count({ where: prismaQuery.where }),
        ]);

        const serializedData = data.map((item) => this.serialize(item));
        return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: number, query: Record<string, any> = {}) {
    // Include/select query params change the payload, so they must be part of the cache key.
    const cacheKey = Object.keys(query).length
      ? `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`
      : `${this.CACHE_PREFIX}:${id}`;

    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const prismaQuery = this.queryService.buildPrismaQuery(query, {
          allowedIncludes: ['*'],
        });

        const findArgs: any = { where: { ID: id } };

        if (prismaQuery.select) {
          findArgs.select = prismaQuery.select;
        } else if (prismaQuery.include) {
          findArgs.include = prismaQuery.include;
        }

        const data = await this.prisma.purchase.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreatePurchaseDto, userId: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { ID: dto.SupplierID } });
    if (!supplier) throw new NotFoundException('Supplier tidak ditemukan');
    if (dto.Items?.some((i) => !(Number(i.Quantity) > 0))) throw new BadRequestException('Jumlah item harus lebih dari 0');

    const code = await this.generateCode();
    const draftStatus = await this.getStatusByCode('DRAFT');
    const paymentStatus = await this.getPaymentStatusByCode('PENDING');
    const purchaseDate = dto.Date ? new Date(dto.Date) : new Date();

    const purchase = await this.prisma.$transaction(
      async (tx) => {
        const warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID);
        const hasItems = !!dto.Items && dto.Items.length > 0;
        const items = hasItems ? await this.buildItems(tx, dto.Items!) : [];
        const t = computeDocTotals({
          subtotal: hasItems ? items.reduce((s, i) => s + Number(i.Subtotal), 0) : dto.Subtotal || 0,
          discount: dto.DiscountAmount || 0,
          taxMode: dto.TaxMode ?? (dto.TaxPercent ? 'EXCLUDE' : 'NON'),
          taxPercent: dto.TaxPercent || 0,
          otherCost: dto.OtherCost || 0,
          otherCostAdds: dto.OtherCostAdds ?? true,
        });

        const created = await tx.purchase.create({
          data: {
            Code: code,
            SupplierID: dto.SupplierID,
            WarehouseID: warehouseId,
            PurchaseOrderID: dto.PurchaseOrderID,
            Date: purchaseDate,
            DueDate: dto.DueDate
              ? new Date(dto.DueDate)
              : supplier.DueDays > 0
                ? new Date(purchaseDate.getTime() + supplier.DueDays * 86400000)
                : null,
            PaymentMethodID: dto.PaymentMethodID,
            Subtotal: new Prisma.Decimal(t.subtotal),
            DiscountPercent: new Prisma.Decimal(dto.DiscountPercent || 0),
            DiscountAmount: new Prisma.Decimal(t.discount),
            TaxPercent: new Prisma.Decimal(t.taxPercent),
            TaxAmount: new Prisma.Decimal(t.tax),
            TaxMode: dto.TaxMode ?? (dto.TaxPercent ? 'EXCLUDE' : 'NON'),
            OtherCost: new Prisma.Decimal(t.otherCost),
            OtherCostAdds: dto.OtherCostAdds ?? true,
            ReferenceNo: dto.ReferenceNo || null,
            Total: new Prisma.Decimal(t.total),
            Paid: new Prisma.Decimal(0),
            Remaining: new Prisma.Decimal(t.total),
            PaymentStatusID: paymentStatus.ID,
            StatusID: draftStatus.ID,
            Notes: dto.Notes,
            CreatedByID: userId,
            ...(hasItems ? { PurchaseItems: { create: items } } : {}),
          },
        });

        await this.applyStock(tx, created.ID, userId);
        await this.journal.postPurchase(tx, created.ID, userId);
        await this.party.recalcSupplier(tx, supplier.ID);
        await recalcPurchaseOrderReceipt(tx, created.PurchaseOrderID);

        return tx.purchase.findUniqueOrThrow({
          where: { ID: created.ID },
          include: { Supplier: true, Warehouse: true, PurchaseItems: { include: { Product: true, Unit: true } } },
        });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    await this.notificationService.notify({
      title: 'Pembelian Baru',
      message: `Transaksi ${purchase.Code} dari ${supplier.Name} sebesar Rp ${Number(purchase.Total).toLocaleString('id-ID')}`,
      typeCode: 'PURCHASE',
      referenceType: 'Purchase',
      referenceId: purchase.ID,
    });
    return this.serialize(purchase);
  }

  async update(id: number, dto: UpdatePurchaseDto, userId?: string) {
    const purchase = await this.prisma.purchase.findUnique({ where: { ID: id }, include: { PurchaseItems: true } });
    if (!purchase) throw new NotFoundException('Purchase not found');
    const status = await this.getStatusById(purchase.StatusID);
    // Seperti Ketoko: pembelian dapat diedit selama belum dibatalkan / diselesaikan.
    if (status?.Code === 'CANCELLED' || status?.Code === 'COMPLETED') {
      throw new BadRequestException('Pembelian yang sudah dibatalkan / selesai tidak dapat diubah');
    }
    if (dto.Items?.some((i) => !(Number(i.Quantity) > 0))) throw new BadRequestException('Jumlah item harus lebih dari 0');

    const updated = await this.prisma.$transaction(
      async (tx) => {
        const newWh = dto.WarehouseID ? await this.ledger.resolveWarehouseId(tx, dto.WarehouseID) : purchase.WarehouseID;
        const discount = dto.DiscountAmount !== undefined ? dto.DiscountAmount : Number(purchase.DiscountAmount);
        const taxPercent = dto.TaxPercent !== undefined ? dto.TaxPercent : Number(purchase.TaxPercent);
        const taxMode = dto.TaxMode ?? purchase.TaxMode;
        const otherCost = dto.OtherCost !== undefined ? dto.OtherCost : Number(purchase.OtherCost);
        const otherCostAdds = dto.OtherCostAdds ?? purchase.OtherCostAdds;
        // Nilai persediaan ikut berubah bila potongan / PPN / biaya berubah.
        const stockChanged =
          !!dto.Items ||
          newWh !== purchase.WarehouseID ||
          Math.abs(discount - Number(purchase.DiscountAmount)) > 0.004 ||
          taxMode !== purchase.TaxMode ||
          Math.abs(taxPercent - Number(purchase.TaxPercent)) > 0.004 ||
          Math.abs(otherCost - Number(purchase.OtherCost)) > 0.004 ||
          otherCostAdds !== purchase.OtherCostAdds;
        const hadLedger = (await tx.stockLedger.count({ where: { RefType: 'PURCHASE', RefID: id } })) > 0;

        // 1) balik stok & HPP lama
        if (stockChanged && hadLedger) await this.reverseStock(tx, id, userId, `Ubah pembelian ${purchase.Code}`);

        // 2) header + (opsional) item baru
        const data: Prisma.PurchaseUncheckedUpdateInput = {};
        if (newWh !== purchase.WarehouseID) data.WarehouseID = newWh;
        if (dto.Date) data.Date = new Date(dto.Date);
        if (dto.DueDate !== undefined) data.DueDate = dto.DueDate ? new Date(dto.DueDate) : null;
        if (dto.PaymentMethodID !== undefined) data.PaymentMethodID = dto.PaymentMethodID;
        if (dto.DiscountPercent !== undefined) data.DiscountPercent = new Prisma.Decimal(dto.DiscountPercent);
        if (dto.TaxPercent !== undefined) data.TaxPercent = new Prisma.Decimal(dto.TaxPercent);
        if (dto.Notes !== undefined) data.Notes = dto.Notes;
        if (dto.ReferenceNo !== undefined) data.ReferenceNo = dto.ReferenceNo || null;
        let subtotal = Number(purchase.Subtotal);
        if (dto.Items) {
          const items = await this.buildItems(tx, dto.Items);
          await tx.purchaseItem.deleteMany({ where: { PurchaseID: id } });
          data.PurchaseItems = { create: items } as any;
          subtotal = items.reduce((s, i) => s + Number(i.Subtotal), 0);
        }
        const t = computeDocTotals({ subtotal, discount, taxMode, taxPercent, otherCost, otherCostAdds });
        Object.assign(data, {
          Subtotal: new Prisma.Decimal(t.subtotal),
          DiscountAmount: new Prisma.Decimal(t.discount),
          TaxPercent: new Prisma.Decimal(t.taxPercent),
          TaxAmount: new Prisma.Decimal(t.tax),
          TaxMode: taxMode,
          OtherCost: new Prisma.Decimal(t.otherCost),
          OtherCostAdds: otherCostAdds,
          Total: new Prisma.Decimal(t.total),
        });
        await tx.purchase.update({ where: { ID: id }, data });

        // 3) terapkan stok & HPP baru (dokumen lama tanpa ledger tidak disentuh stoknya)
        if (stockChanged && (hadLedger || !!dto.Items)) await this.applyStock(tx, id, userId);

        await this.party.recalcPurchase(tx, id);
        await this.journal.postPurchase(tx, id, userId);
        await this.party.recalcSupplier(tx, purchase.SupplierID);
        await recalcPurchaseOrderReceipt(tx, purchase.PurchaseOrderID);

        return tx.purchase.findUniqueOrThrow({
          where: { ID: id },
          include: { Supplier: true, Warehouse: true, PurchaseItems: { include: { Product: true, Unit: true } } },
        });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdateStatusDto, userId?: string) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { ID: id },
      include: { PurchaseItems: true, PurchaseReturns: { include: { Status: true } } },
    });
    if (!purchase) throw new NotFoundException('Purchase not found');

    const currentStatus = await this.getStatusById(purchase.StatusID);
    const currentCode = currentStatus?.Code ?? 'DRAFT';

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[currentCode] || [];
    if (!allowed.includes(dto.StatusCode)) {
      throw new BadRequestException(`Status tidak dapat diubah dari '${currentCode}' ke '${dto.StatusCode}'`);
    }
    if (dto.StatusCode === 'CANCELLED' && purchase.PurchaseReturns.some((r) => r.Status?.Code !== 'CANCELLED')) {
      throw new BadRequestException('Pembelian memiliki retur aktif. Batalkan returnya terlebih dahulu.');
    }

    const newStatus = await this.getStatusByCode(dto.StatusCode);

    const updated = await this.prisma.$transaction(
      async (tx) => {
        if (dto.StatusCode === 'CANCELLED') {
          await this.reverseStock(tx, id, userId, `Pembatalan pembelian ${purchase.Code}`);
          await this.journal.reversePurchase(tx, id);
        }
        await tx.purchase.update({ where: { ID: id }, data: { StatusID: newStatus.ID } });
        await this.party.recalcSupplier(tx, purchase.SupplierID);
        await recalcPurchaseOrderReceipt(tx, purchase.PurchaseOrderID);
        return tx.purchase.findUniqueOrThrow({
          where: { ID: id },
          include: { Supplier: true, Warehouse: true, PurchaseItems: { include: { Product: true, Unit: true } } },
        });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return this.serialize(updated);
  }

  async delete(id: number, userId?: string) {
    const purchase = await this.prisma.purchase.findUnique({ where: { ID: id } });
    if (!purchase) throw new NotFoundException('Purchase not found');
    const status = await this.getStatusById(purchase.StatusID);
    if (status?.Code !== 'DRAFT' && status?.Code !== 'CANCELLED') {
      throw new BadRequestException('Hanya pembelian berstatus DRAFT atau CANCELLED yang dapat dihapus');
    }

    const [returns, payments] = await Promise.all([
      this.prisma.purchaseReturn.count({ where: { PurchaseID: id } }),
      this.prisma.purchasePayment.count({ where: { PurchaseID: id } }),
    ]);
    if (returns > 0) throw new BadRequestException('Pembelian tidak dapat dihapus karena sudah memiliki retur pembelian');
    if (payments > 0) throw new BadRequestException('Pembelian tidak dapat dihapus karena sudah memiliki pembayaran');

    await this.prisma.$transaction(
      async (tx) => {
        // idempoten: pembelian yang sudah dibatalkan tidak dibalik dua kali
        await this.reverseStock(tx, id, userId, `Hapus pembelian ${purchase.Code}`);
        await this.journal.reversePurchase(tx, id);
        await tx.purchase.delete({ where: { ID: id } });
        await this.party.recalcSupplier(tx, purchase.SupplierID);
        await recalcPurchaseOrderReceipt(tx, purchase.PurchaseOrderID);
      },
      { timeout: 30000 },
    );
    await this.afterWrite();
    return { id };
  }

  // ─── Stok & HPP ────────────────────────────────────────────────────────

  private async buildItems(tx: Tx, items: CreatePurchaseItemDto[]) {
    const out: Prisma.PurchaseItemCreateManyPurchaseInput[] = [];
    for (const item of items) {
      const product = await tx.product.findUnique({ where: { ID: item.ProductID }, select: { ID: true } });
      if (!product) throw new BadRequestException(`Produk dengan ID ${item.ProductID} tidak ditemukan`);
      const gross = item.UnitPrice * item.Quantity;
      const disc = item.DiscountAmount || (gross * (item.DiscountPercent || 0)) / 100;
      out.push({
        ProductID: item.ProductID,
        Quantity: new Prisma.Decimal(item.Quantity),
        BaseQuantity: await this.ledger.toBaseQty(tx, item.ProductID, item.UnitID, item.Quantity),
        UnitID: item.UnitID,
        UnitPrice: new Prisma.Decimal(item.UnitPrice),
        DiscountPercent: new Prisma.Decimal(item.DiscountPercent || 0),
        DiscountAmount: new Prisma.Decimal(r2(disc)),
        Subtotal: new Prisma.Decimal(r2(gross - disc)),
      });
    }
    return out;
  }

  /** Harga pokok per satuan dasar per produk (rata-rata bila produk muncul di beberapa baris). */
  private async lineCosts(tx: Tx, purchaseId: number) {
    const p = await tx.purchase.findUniqueOrThrow({ where: { ID: purchaseId }, include: { PurchaseItems: true } });
    const factor = inventoryFactor({ subtotal: Number(p.Subtotal), total: Number(p.Total), tax: Number(p.TaxAmount) });
    const agg = new Map<number, { qty: number; value: number }>();
    for (const it of p.PurchaseItems) {
      const base = Number(it.BaseQuantity) > 0 ? Number(it.BaseQuantity) : Number(it.Quantity);
      const cur = agg.get(it.ProductID) ?? { qty: 0, value: 0 };
      cur.qty += base;
      cur.value += Number(it.Subtotal) * factor;
      agg.set(it.ProductID, cur);
    }
    return { purchase: p, agg };
  }

  private async applyStock(tx: Tx, purchaseId: number, userId?: string) {
    const { purchase, agg } = await this.lineCosts(tx, purchaseId);
    for (const [productId, a] of agg) {
      if (a.qty <= 0) continue;
      const unitCost = a.value / a.qty;
      await this.ledger.applyAverageCostIn(tx, productId, a.qty, unitCost);
      await this.ledger.move(tx, {
        productId,
        warehouseId: purchase.WarehouseID,
        qty: a.qty,
        refType: 'PURCHASE',
        refId: purchase.ID,
        refCode: purchase.Code,
        unitCost,
        userId,
        date: purchase.Date,
      });
    }
  }

  /** Balik stok & HPP semua mutasi PURCHASE dokumen ini (idempoten). */
  private async reverseStock(tx: Tx, purchaseId: number, userId: string | undefined, notes: string) {
    const { purchase, agg } = await this.lineCosts(tx, purchaseId);
    const nets = await this.ledger.netByRef(tx, ['PURCHASE'], purchaseId);
    for (const n of nets) {
      const a = agg.get(n.productId);
      const unitCost = a && a.qty > 0 ? a.value / a.qty : undefined;
      if (n.net.gt(0) && unitCost !== undefined) await this.ledger.applyAverageCostOut(tx, n.productId, n.net, unitCost);
      await this.ledger.move(tx, {
        productId: n.productId,
        warehouseId: n.warehouseId,
        qty: n.net.neg(),
        refType: 'PURCHASE',
        refId: purchaseId,
        refCode: purchase.Code,
        unitCost,
        userId,
        notes,
      });
    }
  }

  private async afterWrite() {
    await Promise.all([
      this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`),
      this.redis.invalidatePattern('supplier:*'),
      this.redis.invalidatePattern('purchase_orders:*'),
      this.ledger.invalidateCaches(),
    ]);
  }

  async getReport(query: Record<string, any>) {
    const { startDate, endDate, supplierId } = query;

    const where: any = {};
    if (startDate || endDate) {
      where.Date = {};
      if (startDate) where.Date.gte = new Date(startDate);
      if (endDate) where.Date.lte = new Date(endDate);
    }
    if (supplierId) where.SupplierID = parseInt(supplierId);

    const purchases = await this.prisma.purchase.findMany({
      where,
      include: {
        Supplier: true,
        PurchaseItems: { include: { Product: true } },
      },
      orderBy: { Date: 'desc' },
    });

    const summary = {
      totalPurchases: purchases.length,
      totalAmount: purchases.reduce((sum, p) => sum + Number(p.Total), 0),
      totalPaid: purchases.reduce((sum, p) => sum + Number(p.Paid), 0),
      totalRemaining: purchases.reduce((sum, p) => sum + Number(p.Remaining), 0),
    };

    return {
      data: purchases.map((p) => this.serialize(p)),
      summary,
    };
  }

  // ─── TransactionStatus / PaymentStatus lookup helpers ──────────────────────

  private async getStatusByCode(code: string) {
    const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Status '${code}' tidak ditemukan`);
    return status;
  }

  private async getStatusById(id: number) {
    return this.prisma.transactionStatus.findUnique({ where: { ID: id } });
  }

  private async getPaymentStatusByCode(code: string) {
    const status = await this.prisma.paymentStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Payment status '${code}' tidak ditemukan`);
    return status;
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `BP-${year}${month}`;

    const lastPurchase = await this.prisma.purchase.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastPurchase) {
      const lastSeq = parseInt(lastPurchase.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serialize(data: any): any {
    if (!data) return null;

    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof Prisma.Decimal) {
        result[key] = Number(value);
      } else if (value instanceof Date) {
        result[key] = value.toISOString();
      } else {
        result[key] = value;
      }
    }

    if (data.PurchaseItems && Array.isArray(data.PurchaseItems)) {
      result.PurchaseItems = data.PurchaseItems.map((item: any) => this.serialize(item));
    }

    return result;
  }
}
