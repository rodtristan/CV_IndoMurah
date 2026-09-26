import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { StockDocumentService } from '../../common/stock/stock-document.service';
import { StockLedgerService } from '../../common/stock/stock-ledger.service';
import { AutoJournalService, REF } from '../../common/accounting/auto-journal.service';
import { Prisma } from '@prisma/client';
import { CreateStockOpnameDto, UpdateStockOpnameDto } from './dto/stock-opname.dto';

/**
 * Stock Opname per gudang: stok sistem diambil dari ProductStock gudang tsb (bukan dari klien),
 * selisih (fisik - sistem) dibukukan lewat StockLedger (RefType OPNAME) sehingga hanya saldo
 * gudang itu yang berubah dan Product.Stock tetap = jumlah semua gudang.
 */
@Injectable()
export class StockOpnameService extends StockDocumentService<
  any,
  CreateStockOpnameDto,
  UpdateStockOpnameDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
    private readonly ledger: StockLedgerService,
    private readonly journal: AutoJournalService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'stockOpname',
      primaryKey: 'ID',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: false,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════

  async createStockOpname(dto: CreateStockOpnameDto, userId: string) {
    if (!dto.Items || dto.Items.length === 0) {
      throw new BadRequestException('Item stock opname tidak boleh kosong');
    }
    if (dto.Items.some((i) => Number(i.CountedStock) < 0)) throw new BadRequestException('Stok fisik tidak boleh minus');
    const seen = new Set<number>();
    for (const i of dto.Items) {
      if (seen.has(i.ProductID)) throw new BadRequestException(`Produk ID ${i.ProductID} muncul lebih dari sekali dalam opname`);
      seen.add(i.ProductID);
    }

    const code = await this.generateCode();
    const completedStatus = await this.getStockOpnameStatusByCode('COMPLETED');
    const docDate = dto.Date ? new Date(dto.Date) : new Date();
    const totalItems = dto.Items.reduce((sum, item) => sum + Number(item.CountedStock), 0);

    const stockOpname = await this.prisma.$transaction(
      async (tx) => {
        const warehouseId = await this.ledger.resolveWarehouseId(tx, dto.WarehouseID);

        // Stok sistem & selisih dihitung di server (satuan item); qty ledger dalam satuan dasar.
        const plan: { item: CreateStockOpnameDto['Items'][number]; system: Prisma.Decimal; diff: Prisma.Decimal; diffBase: Prisma.Decimal; conv: Prisma.Decimal }[] = [];
        for (const item of dto.Items) {
          const conv = await this.ledger.conversion(tx, item.ProductID, item.UnitID);
          const ps = await tx.productStock.findUnique({
            where: { ProductID_WarehouseID: { ProductID: item.ProductID, WarehouseID: warehouseId } },
            select: { Quantity: true },
          });
          let currentBase = new Prisma.Decimal(ps?.Quantity ?? 0);
          if (!ps && (await tx.productStock.count({ where: { ProductID: item.ProductID } })) === 0) {
            // data lama: stok global tanpa baris gudang dianggap berada di gudang default
            if ((await this.ledger.getDefaultWarehouseId(tx)) === warehouseId) {
              const p = await tx.product.findUnique({ where: { ID: item.ProductID }, select: { Stock: true } });
              currentBase = new Prisma.Decimal(p?.Stock ?? 0);
            }
          }
          const countedBase = new Prisma.Decimal(item.CountedStock).mul(conv);
          plan.push({
            item,
            conv,
            system: currentBase.div(conv).toDecimalPlaces(3),
            diff: new Prisma.Decimal(item.CountedStock).minus(currentBase.div(conv)).toDecimalPlaces(3),
            diffBase: countedBase.minus(currentBase),
          });
        }

        const created = await tx.stockOpname.create({
          data: {
            Code: code,
            Date: docDate,
            Warehouse: { connect: { ID: warehouseId } },
            TotalItems: new Prisma.Decimal(totalItems),
            Notes: dto.Notes,
            AccountID: dto.AccountID ?? null,
            Status: { connect: { ID: completedStatus.ID } },
            Creator: { connect: { ID: userId } },
            OpnameItems: {
              create: plan.map((p) => ({
                ProductID: p.item.ProductID,
                SystemStock: p.system,
                CountedStock: new Prisma.Decimal(p.item.CountedStock),
                Difference: p.diff,
                UnitID: p.item.UnitID,
                UnitPrice: new Prisma.Decimal(p.item.UnitPrice ?? 0),
                Note: p.item.Note,
              })),
            },
          },
        });

        for (const p of plan) {
          if (p.diffBase.isZero()) continue;
          const price = Number(p.item.UnitPrice ?? 0);
          await this.ledger.move(tx, {
            productId: p.item.ProductID,
            warehouseId,
            qty: p.diffBase,
            refType: 'OPNAME',
            refId: created.ID,
            refCode: created.Code,
            unitCost: price > 0 ? new Prisma.Decimal(price).div(p.conv) : undefined,
            userId,
            date: docDate,
            notes: p.item.Note ?? dto.Notes,
          });
        }

        await this.journal.postStockDoc(tx, 'STOCK_OPNAME', created, userId);

        return tx.stockOpname.findUniqueOrThrow({
          where: { ID: created.ID },
          include: { Warehouse: true, Status: true, Creator: true, OpnameItems: { include: { Product: true, Unit: true } } },
        });
      },
      { timeout: 30000 },
    );

    await this.afterWrite();
    return this.serializeStockOpname(stockOpname);
  }

  /** Hanya tanggal & keterangan yang dapat diubah; gudang opname tidak dapat dipindah. */
  async patchById(id: any, dto: Partial<UpdateStockOpnameDto>) {
    const doc = await this.prisma.stockOpname.findUnique({ where: { ID: Number(id) } });
    if (!doc) throw new NotFoundException('Stock opname tidak ditemukan');
    if (dto.WarehouseID && Number(dto.WarehouseID) !== doc.WarehouseID) {
      throw new BadRequestException('Gudang stock opname tidak dapat diubah. Hapus dan buat ulang opname di gudang yang benar.');
    }
    const data: Prisma.StockOpnameUncheckedUpdateInput = {};
    if (dto.Date) data.Date = new Date(dto.Date);
    if (dto.Notes !== undefined) data.Notes = dto.Notes;
    if (dto.AccountID !== undefined) data.AccountID = dto.AccountID || null;
    const result = await this.prisma.$transaction(async (tx) => {
      const u = await tx.stockOpname.update({ where: { ID: doc.ID }, data });
      await this.journal.postStockDoc(tx, 'STOCK_OPNAME', u);
      return u;
    });
    await this.afterWrite();
    return this.serializeStockOpname(result);
  }

  async deleteById(id: any, userId?: string) {
    const doc = await this.prisma.stockOpname.findUnique({ where: { ID: Number(id) } });
    if (!doc) throw new NotFoundException('Stock opname tidak ditemukan');
    await this.prisma.$transaction(
      async (tx) => {
        await this.ledger.reverseRef(tx, ['OPNAME'], doc.ID, { refCode: doc.Code, userId, notes: `Hapus opname ${doc.Code}` });
        await this.journal.reverse(tx, REF.STOCK_OPNAME, doc.ID);
        await tx.stockOpname.delete({ where: { ID: doc.ID } });
      },
      { timeout: 30000 },
    );
    await this.afterWrite();
    return this.serializeStockOpname(doc);
  }

  private async afterWrite() {
    await this.invalidateCache();
    await this.ledger.invalidateCaches();
  }

  private async getStockOpnameStatusByCode(code: string) {
    const status = await this.prisma.stockOpnameStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Stock opname status '${code}' tidak ditemukan`);
    return status;
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `OP-${year}${month}`;

    const lastStockOpname = await this.prisma.stockOpname.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastStockOpname) {
      const lastSeq = parseInt(lastStockOpname.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  private serializeStockOpname(data: any): any {
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
    if (data.OpnameItems && Array.isArray(data.OpnameItems)) {
      result.OpnameItems = data.OpnameItems.map((item: any) => this.serializeStockOpname(item));
    }
    return result;
  }
}
