import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import { StockLedgerService } from '../../common/stock/stock-ledger.service';
import { PartyBalanceService } from '../../common/stock/party-balance.service';
import { AutoJournalService } from '../../common/accounting/auto-journal.service';

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;
import { CreateSaleReturnDto, UpdateSaleReturnDto, UpdateSaleReturnStatusDto } from './dto/sale-return.dto';

@Injectable()
export class SaleReturnService {
  private readonly CACHE_PREFIX = 'sale_returns';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
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
          this.prisma.saleReturn.findMany(findArgs),
          this.prisma.saleReturn.count({ where: prismaQuery.where }),
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

        const data = await this.prisma.saleReturn.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreateSaleReturnDto, userId: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { ID: dto.SaleID },
      include: {
        PaymentStatus: true,
        SaleItems: { include: { Product: { select: { Name: true, UnitID: true } } } },
        SaleReturns: { include: { Status: true, ReturnItems: true } },
      },
    });
    if (!sale) throw new NotFoundException('Faktur penjualan tidak ditemukan');
    if (sale.PaymentStatus?.Code?.toUpperCase() === 'CANCELLED') throw new BadRequestException('Faktur penjualan sudah dibatalkan');
    const lines = (dto.Items ?? []).filter((i) => Number(i.Quantity) !== 0);
    if (lines.length === 0) throw new BadRequestException('Isi jumlah retur minimal satu item');
    if (lines.some((i) => !(Number(i.Quantity) > 0))) throw new BadRequestException('Jumlah retur harus lebih dari 0');

    const code = await this.generateCode();
    const status = await this.getStatusByCode('DRAFT');
    const returnDate = dto.Date ? new Date(dto.Date) : new Date();

    const saleReturn = await this.prisma.$transaction(
      async (tx) => {
        const warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID ?? sale.WarehouseID);

        // Qty terjual & HPP per produk (satuan dasar)
        const sold = new Map<number, { qty: number; cost: number; name: string; unitId: number | null }>();
        for (const it of sale.SaleItems) {
          const base = Number(it.BaseQuantity) > 0 ? Number(it.BaseQuantity) : Number(await this.ledger.toBaseQty(tx, it.ProductID, it.UnitID, it.Quantity));
          const cur = sold.get(it.ProductID) ?? { qty: 0, cost: 0, name: it.Product?.Name ?? `#${it.ProductID}`, unitId: it.UnitID ?? it.Product?.UnitID ?? null };
          cur.cost = cur.qty + base > 0 ? (cur.cost * cur.qty + Number(it.CostPrice) * base) / (cur.qty + base) : 0;
          cur.qty += base;
          sold.set(it.ProductID, cur);
        }
        const returned = new Map<number, number>();
        let prevTotal = 0;
        for (const r of sale.SaleReturns) {
          if (r.Status?.Code?.toUpperCase() === 'CANCELLED') continue;
          prevTotal += Number(r.TotalReturn);
          for (const it of r.ReturnItems) {
            const base = Number(it.BaseQuantity) > 0 ? Number(it.BaseQuantity) : Number(await this.ledger.toBaseQty(tx, it.ProductID, it.UnitID, it.Quantity));
            returned.set(it.ProductID, (returned.get(it.ProductID) ?? 0) + base);
          }
        }

        const itemsData: Prisma.SaleReturnItemCreateManySaleReturnInput[] = [];
        const requested = new Map<number, number>();
        for (const item of lines) {
          const s = sold.get(item.ProductID);
          if (!s) throw new BadRequestException(`Produk ID ${item.ProductID} tidak ada pada faktur ${sale.Code}`);
          const unitId = item.UnitID ?? s.unitId;
          const base = Number(await this.ledger.toBaseQty(tx, item.ProductID, unitId, item.Quantity));
          requested.set(item.ProductID, (requested.get(item.ProductID) ?? 0) + base);
          itemsData.push({
            ProductID: item.ProductID,
            UnitID: unitId,
            Quantity: new Prisma.Decimal(item.Quantity),
            BaseQuantity: new Prisma.Decimal(base),
            UnitPrice: new Prisma.Decimal(item.UnitPrice),
            Subtotal: new Prisma.Decimal(r2(item.UnitPrice * item.Quantity)),
          });
        }
        for (const [pid, q] of requested) {
          const s = sold.get(pid)!;
          const left = s.qty - (returned.get(pid) ?? 0);
          if (q > left + 0.0005) {
            throw new BadRequestException(`Jumlah retur ${s.name} melebihi jumlah terjual (sisa yang dapat diretur ${Math.max(left, 0)})`);
          }
        }
        const totalReturn = r2(itemsData.reduce((a, i) => a + Number(i.Subtotal), 0));
        if (prevTotal + totalReturn > Number(sale.Total) + 0.005) {
          throw new BadRequestException(`Nilai retur melebihi sisa nilai faktur ${sale.Code} (maksimal ${r2(Number(sale.Total) - prevTotal)})`);
        }

        const created = await tx.saleReturn.create({
          data: {
            Code: code,
            SaleID: dto.SaleID,
            CustomerID: sale.CustomerID,
            WarehouseID: warehouseId,
            Date: returnDate,
            TotalReturn: new Prisma.Decimal(totalReturn),
            Reason: dto.Reason,
            StatusID: status.ID,
            CreatedByID: userId,
            ReturnItems: { create: itemsData },
          },
        });

        for (const [pid, q] of requested) {
          await this.ledger.move(tx, {
            productId: pid,
            warehouseId,
            qty: q,
            refType: 'SALE_RETURN',
            refId: created.ID,
            refCode: created.Code,
            unitCost: sold.get(pid)!.cost,
            userId,
            date: returnDate,
          });
        }

        await tx.sale.update({ where: { ID: sale.ID }, data: { IsReturn: true, ReturnedAt: returnDate } });
        await this.party.recalcSale(tx, sale.ID);
        await this.party.recalcCustomer(tx, sale.CustomerID);
        await this.journal.postSaleReturn(tx, created.ID, userId);

        return tx.saleReturn.findUniqueOrThrow({ where: { ID: created.ID }, include: this.fullInclude });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return this.serialize(saleReturn);
  }

  async update(id: number, dto: UpdateSaleReturnDto, userId?: string) {
    const saleReturn = await this.prisma.saleReturn.findUnique({ where: { ID: id }, include: { Status: true } });
    if (!saleReturn) throw new NotFoundException('Sale return not found');

    const statusCode = saleReturn.Status?.Code?.toUpperCase();
    if (statusCode && statusCode !== 'DRAFT') {
      throw new BadRequestException('Hanya retur berstatus DRAFT yang dapat diubah');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      let warehouseId: number | undefined;
      if (dto.WarehouseID) {
        warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID);
        if (warehouseId !== saleReturn.WarehouseID) {
          await this.ledger.relocateRef(tx, ['SALE_RETURN'], id, warehouseId, { refCode: saleReturn.Code, userId });
        }
      }
      await tx.saleReturn.update({
        where: { ID: id },
        data: { WarehouseID: warehouseId, Date: dto.Date ? new Date(dto.Date) : undefined, Reason: dto.Reason },
      });
      if (dto.Date) await this.journal.postSaleReturn(tx, id, userId);
      return tx.saleReturn.findUniqueOrThrow({ where: { ID: id }, include: this.fullInclude });
    });

    await this.afterWrite();
    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdateSaleReturnStatusDto, userId?: string) {
    const saleReturn = await this.prisma.saleReturn.findUnique({
      where: { ID: id },
      include: { Status: true, ReturnItems: true },
    });
    if (!saleReturn) throw new NotFoundException('Sale return not found');

    const currentStatus = saleReturn.Status?.Code?.toUpperCase() || 'DRAFT';
    const newStatus = dto.StatusCode.toUpperCase();

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(`Status tidak dapat diubah dari '${currentStatus}' ke '${newStatus}'`);
    }

    const newStatus_ = await this.getStatusByCode(newStatus);

    const updated = await this.prisma.$transaction(
      async (tx) => {
        await tx.saleReturn.update({ where: { ID: id }, data: { StatusID: newStatus_.ID } });
        if (newStatus === 'CANCELLED') await this.undoEffects(tx, saleReturn, userId, `Pembatalan retur ${saleReturn.Code}`);
        return tx.saleReturn.findUniqueOrThrow({ where: { ID: id }, include: this.fullInclude });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return this.serialize(updated);
  }

  async delete(id: number, userId?: string) {
    const saleReturn = await this.prisma.saleReturn.findUnique({
      where: { ID: id },
      include: { Status: true },
    });
    if (!saleReturn) throw new NotFoundException('Sale return not found');

    const statusCode = saleReturn.Status?.Code?.toUpperCase();
    if (statusCode && statusCode !== 'DRAFT' && statusCode !== 'CANCELLED') {
      throw new BadRequestException('Hanya retur berstatus DRAFT atau CANCELLED yang dapat dihapus');
    }

    await this.prisma.$transaction(
      async (tx) => {
        await tx.saleReturn.delete({ where: { ID: id } });
        await this.undoEffects(tx, saleReturn, userId, `Hapus retur ${saleReturn.Code}`);
      },
      { timeout: 30000 },
    );
    await this.afterWrite();

    return { id };
  }

  /** Balik stok (idempoten), jurnal, status faktur & piutang. Dipanggil setelah retur dibatalkan/dihapus. */
  private async undoEffects(tx: Prisma.TransactionClient, r: { ID: number; Code: string; SaleID: number; CustomerID: number }, userId: string | undefined, notes: string) {
    await this.ledger.reverseRef(tx, ['SALE_RETURN'], r.ID, { refCode: r.Code, userId, notes });
    await this.journal.reverseSaleReturn(tx, r.ID);
    const active = await tx.saleReturn.count({ where: { SaleID: r.SaleID, NOT: { Status: { Code: 'CANCELLED' } } } });
    if (active === 0) await tx.sale.update({ where: { ID: r.SaleID }, data: { IsReturn: false, ReturnedAt: null } });
    await this.party.recalcSale(tx, r.SaleID);
    await this.party.recalcCustomer(tx, r.CustomerID);
  }

  private readonly fullInclude = {
    Sale: true,
    Customer: true,
    Warehouse: true,
    Status: true,
    ReturnItems: { include: { Product: true, Unit: true } },
  } as const;

  private async afterWrite() {
    await Promise.all([
      this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`),
      this.redis.invalidatePattern('sales:*'),
      this.redis.invalidatePattern('customer:*'),
      this.ledger.invalidateCaches(),
    ]);
  }

  // ─── TransactionStatus lookup helper ───────────────────────────────────

  private async getStatusByCode(code: string) {
    const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Status '${code}' tidak ditemukan`);
    return status;
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `SR-${year}${month}`;

    const lastReturn = await this.prisma.saleReturn.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastReturn) {
      const lastSeq = parseInt(lastReturn.Code.split('-').pop() || '0', 10);
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

    if (data.ReturnItems && Array.isArray(data.ReturnItems)) {
      result.ReturnItems = data.ReturnItems.map((item: any) => this.serialize(item));
    }

    return result;
  }
}
