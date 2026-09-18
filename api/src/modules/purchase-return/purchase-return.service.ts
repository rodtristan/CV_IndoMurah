import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import { CreatePurchaseReturnDto, UpdatePurchaseReturnDto, UpdatePurchaseReturnStatusDto } from './dto/purchase-return.dto';

@Injectable()
export class PurchaseReturnService {
  private readonly CACHE_PREFIX = 'purchase_returns';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private queryService: QueryService,
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
          this.prisma.purchaseReturn.findMany(findArgs),
          this.prisma.purchaseReturn.count({ where: prismaQuery.where }),
        ]);

        const serializedData = data.map((item) => this.serialize(item));
        return { data: serializedData, total, skip: prismaQuery.skip, take: prismaQuery.take };
      },
      this.CACHE_TTL,
    );
  }

  async findOne(id: number, query: Record<string, any> = {}) {
    const cacheKey = `${this.CACHE_PREFIX}:${id}`;

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

        const data = await this.prisma.purchaseReturn.findUnique(findArgs);
        return data ? this.serialize(data) : null;
      },
      this.CACHE_TTL,
    );
  }

  async create(dto: CreatePurchaseReturnDto, userId: string) {
    // Verify purchase exists
    const purchase = await this.prisma.purchase.findUnique({ where: { ID: dto.PurchaseID } });
    if (!purchase) throw new NotFoundException('Purchase not found');

    const code = await this.generateCode();
    const draftStatus = await this.getStatusByCode('DRAFT');

    // Calculate total return
    const itemsData = dto.Items.map((item) => {
      const subtotal = item.UnitPrice * item.Quantity;
      return {
        ProductID: item.ProductID,
        Quantity: new Prisma.Decimal(item.Quantity.toString()),
        UnitID: item.UnitID,
        UnitPrice: new Prisma.Decimal(item.UnitPrice.toString()),
        Subtotal: new Prisma.Decimal(subtotal.toString()),
      };
    });

    const totalReturn = itemsData.reduce((sum, item) => sum + Number(item.Subtotal), 0);

    const purchaseReturn = await this.prisma.purchaseReturn.create({
      data: {
        Code: code,
        PurchaseID: dto.PurchaseID,
        SupplierID: dto.SupplierID || purchase.SupplierID,
        WarehouseID: dto.WarehouseID,
        Date: dto.Date ? new Date(dto.Date) : new Date(),
        TotalReturn: new Prisma.Decimal(totalReturn.toString()),
        Reason: dto.Reason,
        StatusID: draftStatus.ID,
        CreatedByID: userId,
        ReturnItems: {
          create: itemsData,
        },
      },
      include: {
        Purchase: true,
        Supplier: true,
        Warehouse: true,
        ReturnItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(purchaseReturn);
  }

  async update(id: number, dto: UpdatePurchaseReturnDto) {
    const purchaseReturn = await this.prisma.purchaseReturn.findUnique({ where: { ID: id } });
    if (!purchaseReturn) throw new NotFoundException('Purchase return not found');
    const status = await this.getStatusById(purchaseReturn.StatusID);
    if (status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only update draft purchase returns');
    }

    const updated = await this.prisma.purchaseReturn.update({
      where: { ID: id },
      data: {
        WarehouseID: dto.WarehouseID,
        Date: dto.Date ? new Date(dto.Date) : undefined,
        Reason: dto.Reason,
      },
      include: {
        Purchase: true,
        Supplier: true,
        Warehouse: true,
        ReturnItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdatePurchaseReturnStatusDto) {
    const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
      where: { ID: id },
      include: { ReturnItems: true },
    });
    if (!purchaseReturn) throw new NotFoundException('Purchase return not found');

    const currentStatus = await this.getStatusById(purchaseReturn.StatusID);
    const currentCode = currentStatus?.Code ?? 'DRAFT';

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[currentCode] || [];
    if (!allowed.includes(dto.StatusCode)) {
      throw new BadRequestException(`Cannot transition from '${currentCode}' to '${dto.StatusCode}'`);
    }

    const newStatus = await this.getStatusByCode(dto.StatusCode);

    const updated = await this.prisma.purchaseReturn.update({
      where: { ID: id },
      data: { StatusID: newStatus.ID },
      include: {
        Purchase: true,
        Supplier: true,
        Warehouse: true,
        ReturnItems: { include: { Product: true, Unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async delete(id: number) {
    const purchaseReturn = await this.prisma.purchaseReturn.findUnique({ where: { ID: id } });
    if (!purchaseReturn) throw new NotFoundException('Purchase return not found');
    const status = await this.getStatusById(purchaseReturn.StatusID);
    if (status?.Code !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft purchase returns');
    }

    await this.prisma.purchaseReturn.delete({ where: { ID: id } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return { id };
  }

  // ─── TransactionStatus lookup helpers ───────────────────────────────────

  private async getStatusByCode(code: string) {
    const status = await this.prisma.transactionStatus.findUnique({ where: { Code: code } });
    if (!status) throw new BadRequestException(`Status '${code}' tidak ditemukan`);
    return status;
  }

  private async getStatusById(id: number) {
    return this.prisma.transactionStatus.findUnique({ where: { ID: id } });
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PR-${year}${month}`;

    const lastReturn = await this.prisma.purchaseReturn.findFirst({
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
