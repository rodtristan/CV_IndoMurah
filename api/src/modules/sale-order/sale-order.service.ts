import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { computeDocTotals } from '../../common/accounting/doc-totals';
import { AutoJournalService } from '../../common/accounting/auto-journal.service';
import { DepositLedgerService } from '../../common/accounting/deposit-ledger.service';
import { DepositDocHelper } from '../../common/accounting/deposit-doc.helper';
import { recalcSaleOrderDelivery } from '../../common/sales/sale-order-delivery';
import { CreateSaleOrderDto, UpdateSaleOrderDto, UpdateSaleOrderStatusDto } from './dto/sale-order.dto';

const INCLUDE_FULL = {
  Customer: true,
  SalesPerson: true,
  Warehouse: true,
  Status: true,
  SaleOrderItems: { include: { Product: true, Unit: true }, orderBy: { ID: 'asc' as const } },
};

/**
 * Pesanan Penjualan (Sales Order). Tidak mengurangi stok; penjualan yang merujuk pesanan
 * mengisi Jml Kirim / Status Proses. DP pesanan dicatat sebagai Deposit Pelanggan (DPIN,
 * jurnal Dr Kas / Cr Deposit Pelanggan) sehingga dapat dipakai saat pembayaran penjualan.
 */
@Injectable()
export class SaleOrderService {
  private readonly CACHE_PREFIX = 'sale_orders';
  private readonly CACHE_TTL = 60;
  private readonly deposit: DepositDocHelper;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
    journal: AutoJournalService,
    ledger: DepositLedgerService,
  ) {
    this.deposit = new DepositDocHelper(prisma, journal, ledger, 'customer');
  }

  async findAll(query: Record<string, any>) {
    const cacheKey = this.queryService.generateCacheKey(this.CACHE_PREFIX, query);
    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const q = this.queryService.buildPrismaQuery(query, { searchableFields: ['*'], allowedIncludes: ['*'], defaultOrderBy: { CreatedAt: 'desc' } });
        const args: any = { where: q.where, orderBy: q.orderBy, skip: q.skip, take: q.take };
        if (q.select) args.select = q.select;
        else if (q.include) args.include = q.include;
        const [data, total] = await Promise.all([this.prisma.saleOrder.findMany(args), this.prisma.saleOrder.count({ where: q.where })]);
        return { data: data.map((d) => this.serialize(d)), total, skip: q.skip, take: q.take };
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: number, query: Record<string, any> = {}) {
    const cacheKey = `${this.CACHE_PREFIX}:${id}:${this.queryService.generateCacheKey('q', query)}`;
    return this.redis.getOrSet(
      cacheKey,
      async () => {
        const q = this.queryService.buildPrismaQuery(query, { allowedIncludes: ['*'] });
        const args: any = { where: { ID: id } };
        if (q.select) args.select = q.select;
        else if (q.include) args.include = q.include;
        const data = await this.prisma.saleOrder.findUnique(args);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  /** Pesanan pelanggan yang masih bisa dijual (belum selesai / batal) — untuk lookup "Pesanan" di form penjualan. */
  async open(customerId?: number) {
    const rows = await this.prisma.saleOrder.findMany({
      where: {
        ...(customerId ? { CustomerID: customerId } : {}),
        ProcessStatus: { not: 'DONE' },
        OrderStatus: { not: 'CANCELLED' },
        Status: { Code: { notIn: ['CANCELLED', 'COMPLETED'] } },
      },
      orderBy: { Date: 'desc' },
      take: 200,
      include: INCLUDE_FULL,
    });
    return rows.map((r) => this.serialize(r));
  }

  async create(dto: CreateSaleOrderDto, userId: string) {
    const customer = await this.prisma.customer.findUnique({ where: { ID: dto.CustomerID } });
    if (!customer) throw new NotFoundException('Pelanggan tidak ditemukan');
    const code = await this.generateCode();
    const draft = await this.getStatusByCode('DRAFT');

    const so = await this.prisma.$transaction(async (tx) => {
      const items = this.buildItems(dto.Items);
      const t = this.docTotals(items, dto);
      const created = await tx.saleOrder.create({
        data: {
          Code: code,
          CustomerID: dto.CustomerID,
          SalesPersonID: dto.SalesPersonID ?? null,
          WarehouseID: dto.WarehouseID ?? null,
          Date: dto.Date ? new Date(dto.Date) : new Date(),
          DueDate: dto.DueDate ? new Date(dto.DueDate) : null,
          DeliveryDate: dto.DeliveryDate ? new Date(dto.DeliveryDate) : null,
          OrderStatus: dto.OrderStatus ?? 'WAITING_PAYMENT',
          Notes: dto.Notes ?? null,
          ...this.totalsData(t, dto),
          DownPayment: new Prisma.Decimal(Math.min(dto.DownPayment ?? 0, t.total)),
          StatusID: draft.ID,
          CreatedByID: userId,
          OrderedQty: new Prisma.Decimal(items.reduce((s, i) => s + Number(i.Quantity), 0)),
          SaleOrderItems: { create: items },
        },
      });
      return created;
    });

    await this.syncDownPayment(so.ID, dto, userId);
    await this.invalidate();
    return this.findFull(so.ID);
  }

  async update(id: number, dto: UpdateSaleOrderDto, userId: string) {
    const so = await this.prisma.saleOrder.findUnique({ where: { ID: id }, include: { SaleOrderItems: true, Status: true } });
    if (!so) throw new NotFoundException('Pesanan penjualan tidak ditemukan');
    if (so.Status.Code === 'CANCELLED' || so.Status.Code === 'COMPLETED') {
      throw new BadRequestException('Pesanan yang sudah selesai / batal tidak dapat diubah');
    }
    if (dto.Items && Number(so.DeliveredQty) > 0) {
      throw new BadRequestException('Item pesanan tidak dapat diganti karena sebagian sudah dijual');
    }

    await this.prisma.$transaction(async (tx) => {
      const items = dto.Items ? this.buildItems(dto.Items) : null;
      const merged = {
        TaxMode: dto.TaxMode ?? so.TaxMode,
        TaxPercent: dto.TaxPercent ?? Number(so.TaxPercent),
        DiscountPercent: dto.DiscountPercent ?? Number(so.DiscountPercent),
        DiscountAmount: dto.DiscountAmount ?? Number(so.DiscountAmount),
        OtherCost: dto.OtherCost ?? Number(so.OtherCost),
        OtherCostAdds: dto.OtherCostAdds ?? so.OtherCostAdds,
      };
      const t = this.docTotals(items ?? so.SaleOrderItems, merged);
      const data: Prisma.SaleOrderUncheckedUpdateInput = {
        ...this.totalsData(t, merged),
        DownPayment: new Prisma.Decimal(Math.min(dto.DownPayment ?? Number(so.DownPayment), t.total)),
      };
      if (dto.CustomerID !== undefined) data.CustomerID = dto.CustomerID;
      if (dto.SalesPersonID !== undefined) data.SalesPersonID = dto.SalesPersonID ?? null;
      if (dto.WarehouseID !== undefined) data.WarehouseID = dto.WarehouseID ?? null;
      if (dto.Date) data.Date = new Date(dto.Date);
      if (dto.DueDate !== undefined) data.DueDate = dto.DueDate ? new Date(dto.DueDate) : null;
      if (dto.DeliveryDate !== undefined) data.DeliveryDate = dto.DeliveryDate ? new Date(dto.DeliveryDate) : null;
      if (dto.OrderStatus !== undefined) data.OrderStatus = dto.OrderStatus;
      if (dto.Notes !== undefined) data.Notes = dto.Notes ?? null;
      if (items) {
        await tx.saleOrderItem.deleteMany({ where: { SaleOrderID: id } });
        data.SaleOrderItems = { create: items } as any;
      }
      await tx.saleOrder.update({ where: { ID: id }, data });
      await recalcSaleOrderDelivery(tx, id);
    });

    await this.syncDownPayment(id, dto, userId);
    await this.invalidate();
    return this.findFull(id);
  }

  async updateStatus(id: number, dto: UpdateSaleOrderStatusDto) {
    const so = await this.prisma.saleOrder.findUnique({ where: { ID: id }, include: { Status: true } });
    if (!so) throw new NotFoundException('Pesanan penjualan tidak ditemukan');
    const allowed: Record<string, string[]> = { DRAFT: ['CONFIRMED', 'COMPLETED', 'CANCELLED'], CONFIRMED: ['COMPLETED', 'CANCELLED'] };
    if (!(allowed[so.Status.Code] ?? []).includes(dto.StatusCode)) {
      throw new BadRequestException(`Status tidak dapat diubah dari '${so.Status.Code}' ke '${dto.StatusCode}'`);
    }
    const st = await this.getStatusByCode(dto.StatusCode);
    await this.prisma.saleOrder.update({
      where: { ID: id },
      data: { StatusID: st.ID, ...(dto.StatusCode === 'CANCELLED' ? { OrderStatus: 'CANCELLED' } : {}) },
    });
    await this.invalidate();
    return this.findFull(id);
  }

  async delete(id: number) {
    const so = await this.prisma.saleOrder.findUnique({ where: { ID: id }, include: { _count: { select: { Sales: true } } } });
    if (!so) throw new NotFoundException('Pesanan penjualan tidak ditemukan');
    if (so._count.Sales > 0) throw new BadRequestException('Pesanan sudah dipakai di penjualan; hapus / batalkan penjualannya terlebih dahulu');
    if (so.DepositID) {
      try {
        await this.deposit.remove(so.DepositID);
      } catch (e) {
        if (!(e instanceof NotFoundException)) throw new BadRequestException('DP pesanan sudah terpakai sehingga pesanan tidak dapat dihapus');
      }
    }
    await this.prisma.saleOrder.delete({ where: { ID: id } });
    await this.invalidate();
    return { id };
  }

  // ─── DP → Deposit Pelanggan ───────────────────────────────────────────

  private async syncDownPayment(id: number, dto: { DownPayment?: number; DPMethodID?: number | null; DPAccountID?: number | null }, userId: string) {
    const so = await this.prisma.saleOrder.findUniqueOrThrow({ where: { ID: id } });
    const dp = Number(so.DownPayment);
    const input = {
      customerId: so.CustomerID,
      amount: dp,
      date: so.Date.toISOString(),
      description: `DP Pesanan ${so.Code}`,
      referenceNumber: so.Code,
      type: 'IN' as const,
      paymentMethodId: dto.DPMethodID ?? undefined,
      cashAccountId: dto.DPAccountID ?? undefined,
    };
    if (so.DepositID) {
      const exists = await this.prisma.customerDeposit.findUnique({ where: { ID: so.DepositID } });
      if (!exists) {
        await this.prisma.saleOrder.update({ where: { ID: id }, data: { DepositID: null } });
      } else if (dp <= 0) {
        try {
          await this.deposit.remove(so.DepositID);
        } catch {
          throw new BadRequestException('DP pesanan sudah terpakai sehingga tidak dapat dihapus');
        }
        await this.prisma.saleOrder.update({ where: { ID: id }, data: { DepositID: null } });
        return;
      } else {
        const changed = Math.abs(Number(exists.Amount) - dp) > 0.005 || exists.CustomerID !== so.CustomerID || dto.DPMethodID !== undefined || dto.DPAccountID !== undefined;
        if (changed) {
          try {
            await this.deposit.update(so.DepositID, input, userId);
          } catch {
            throw new BadRequestException('DP pesanan sudah terpakai; nilai DP tidak dapat dikurangi di bawah yang sudah dipakai');
          }
        }
        return;
      }
    }
    if (dp > 0) {
      const dep = await this.deposit.create(input, userId);
      await this.prisma.saleOrder.update({ where: { ID: id }, data: { DepositID: dep.ID } });
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────

  private buildItems(items: CreateSaleOrderDto['Items']) {
    return items.map((item) => {
      const gross = item.UnitPrice * item.Quantity;
      const disc = item.DiscountAmount ?? (gross * (item.DiscountPercent ?? 0)) / 100;
      return {
        ProductID: item.ProductID,
        Quantity: new Prisma.Decimal(item.Quantity),
        UnitID: item.UnitID,
        UnitPrice: new Prisma.Decimal(item.UnitPrice),
        DiscountPercent: new Prisma.Decimal(item.DiscountPercent ?? 0),
        DiscountAmount: new Prisma.Decimal(Math.round(disc * 100) / 100),
        Subtotal: new Prisma.Decimal(Math.round((gross - disc) * 100) / 100),
      };
    });
  }

  private docTotals(
    items: { Subtotal: Prisma.Decimal | number }[],
    h: { TaxMode?: string; TaxPercent?: number; DiscountPercent?: number; DiscountAmount?: number; OtherCost?: number; OtherCostAdds?: boolean },
  ) {
    const subtotal = items.reduce((s, i) => s + Number(i.Subtotal), 0);
    const discount = h.DiscountAmount ?? (subtotal * (h.DiscountPercent ?? 0)) / 100;
    return computeDocTotals({
      subtotal, discount, taxMode: h.TaxMode ?? (h.TaxPercent ? 'EXCLUDE' : 'NON'), taxPercent: h.TaxPercent ?? 0,
      otherCost: h.OtherCost ?? 0, otherCostAdds: h.OtherCostAdds ?? true,
    });
  }

  private totalsData(t: ReturnType<typeof computeDocTotals>, h: { TaxMode?: string; TaxPercent?: number; DiscountPercent?: number; OtherCostAdds?: boolean }) {
    return {
      Subtotal: new Prisma.Decimal(t.subtotal),
      DiscountPercent: new Prisma.Decimal(h.DiscountPercent ?? 0),
      DiscountAmount: new Prisma.Decimal(t.discount),
      TaxMode: h.TaxMode ?? (h.TaxPercent ? 'EXCLUDE' : 'NON'),
      TaxPercent: new Prisma.Decimal(t.taxPercent),
      TaxAmount: new Prisma.Decimal(t.tax),
      OtherCost: new Prisma.Decimal(t.otherCost),
      OtherCostAdds: h.OtherCostAdds ?? true,
      Total: new Prisma.Decimal(t.total),
    };
  }

  private async findFull(id: number) {
    const so = await this.prisma.saleOrder.findUniqueOrThrow({ where: { ID: id }, include: INCLUDE_FULL });
    return this.serialize(so);
  }

  private async generateCode(): Promise<string> {
    const d = new Date();
    const prefix = `PJ-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
    const last = await this.prisma.saleOrder.findFirst({ where: { Code: { startsWith: prefix } }, orderBy: { Code: 'desc' }, select: { Code: true } });
    const seq = last ? parseInt(last.Code.split('-').pop() || '0', 10) + 1 : 1;
    return `${prefix}-${String(seq).padStart(4, '0')}`;
  }

  private async getStatusByCode(code: string) {
    const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Status '${code}' tidak ditemukan`);
    return status;
  }

  private async invalidate() {
    await Promise.all([
      this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`),
      this.redis.invalidatePattern('customer*'),
      this.redis.invalidatePattern('journal:*'),
    ]);
  }

  private serialize(v: any): any {
    if (v instanceof Prisma.Decimal) return Number(v);
    if (v instanceof Date) return v.toISOString();
    if (Array.isArray(v)) return v.map((x) => this.serialize(x));
    if (v && typeof v === 'object') {
      const r: any = {};
      for (const [k, x] of Object.entries(v)) r[k] = this.serialize(x);
      return r;
    }
    return v;
  }
}
