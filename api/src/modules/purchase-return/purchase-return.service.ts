import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { Prisma } from '@prisma/client';
import { CreatePurchaseReturnDto, UpdatePurchaseReturnDto, UpdateStatusDto } from './dto/purchase-return.dto';

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
          defaultOrderBy: { createdAt: 'desc' },
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

        const findArgs: any = { where: { id } };

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
    const purchase = await this.prisma.purchase.findUnique({ where: { id: dto.purchaseId } });
    if (!purchase) throw new NotFoundException('Purchase not found');

    const code = await this.generateCode();

    // Calculate total return
    const itemsData = dto.items.map((item) => {
      const subtotal = item.unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: new Prisma.Decimal(item.quantity.toString()),
        unitId: item.unitId,
        unitPrice: new Prisma.Decimal(item.unitPrice.toString()),
        subtotal: new Prisma.Decimal(subtotal.toString()),
      };
    });

    const totalReturn = itemsData.reduce((sum, item) => sum + Number(item.subtotal), 0);

    const purchaseReturn = await this.prisma.purchaseReturn.create({
      data: {
        code,
        purchaseId: dto.purchaseId,
        supplierId: dto.supplierId || purchase.supplierId,
        warehouseId: dto.warehouseId,
        date: dto.date ? new Date(dto.date) : new Date(),
        totalReturn: new Prisma.Decimal(totalReturn.toString()),
        reason: dto.reason,
        status: 'DRAFT',
        createdById: userId,
        returnItems: {
          create: itemsData,
        },
      },
      include: {
        purchase: true,
        supplier: true,
        warehouse: true,
        returnItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(purchaseReturn);
  }

  async update(id: number, dto: UpdatePurchaseReturnDto) {
    const purchaseReturn = await this.prisma.purchaseReturn.findUnique({ where: { id } });
    if (!purchaseReturn) throw new NotFoundException('Purchase return not found');
    if (purchaseReturn.status !== 'DRAFT') {
      throw new BadRequestException('Can only update draft purchase returns');
    }

    const updated = await this.prisma.purchaseReturn.update({
      where: { id },
      data: {
        warehouseId: dto.warehouseId,
        date: dto.date ? new Date(dto.date) : undefined,
        reason: dto.reason,
      },
      include: {
        purchase: true,
        supplier: true,
        warehouse: true,
        returnItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async updateStatus(id: number, dto: UpdateStatusDto) {
    const purchaseReturn = await this.prisma.purchaseReturn.findUnique({
      where: { id },
      include: { returnItems: true },
    });
    if (!purchaseReturn) throw new NotFoundException('Purchase return not found');

    const validTransitions: Record<string, string[]> = {
      DRAFT: ['CONFIRMED', 'CANCELLED'],
      CONFIRMED: ['COMPLETED', 'CANCELLED'],
    };

    const allowed = validTransitions[purchaseReturn.status] || [];
    if (!allowed.includes(dto.status)) {
      throw new BadRequestException(`Cannot transition from '${purchaseReturn.status}' to '${dto.status}'`);
    }

    const updated = await this.prisma.purchaseReturn.update({
      where: { id },
      data: { status: dto.status as any },
      include: {
        purchase: true,
        supplier: true,
        warehouse: true,
        returnItems: { include: { product: true, unit: true } },
      },
    });

    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return this.serialize(updated);
  }

  async delete(id: number) {
    const purchaseReturn = await this.prisma.purchaseReturn.findUnique({ where: { id } });
    if (!purchaseReturn) throw new NotFoundException('Purchase return not found');
    if (purchaseReturn.status !== 'DRAFT') {
      throw new BadRequestException('Can only delete draft purchase returns');
    }

    await this.prisma.purchaseReturn.delete({ where: { id } });
    await this.redis.invalidatePattern(`${this.CACHE_PREFIX}:*`);

    return { id };
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `PR-${year}${month}`;

    const lastReturn = await this.prisma.purchaseReturn.findFirst({
      where: { code: { startsWith: prefix } },
      orderBy: { code: 'desc' },
      select: { code: true },
    });

    let nextNumber = 1;
    if (lastReturn) {
      const lastSeq = parseInt(lastReturn.code.split('-').pop() || '0', 10);
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

    if (data.returnItems && Array.isArray(data.returnItems)) {
      result.returnItems = data.returnItems.map((item: any) => this.serialize(item));
    }

    return result;
  }
}
