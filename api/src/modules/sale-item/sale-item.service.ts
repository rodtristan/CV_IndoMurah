import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { ReadOnlyItemService } from '../../common/stock/read-only-item.service';
import { CreateSaleItemDto, UpdateSaleItemDto } from './dto/sale-item.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SaleItemService extends ReadOnlyItemService<
  any,
  CreateSaleItemDto,
  UpdateSaleItemDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'saleItem',
      primaryKey: 'ID',
      // Use '*' to allow all fields (searchable, sortable, selectable, includable)
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
  // Tambahkan method bisnis logic di sini
  // Contoh:
  //
  // async processTransaction(data: CreateSaleItemDto, userId: string) {
  //   return this.prisma.$transaction(async (tx) => {
  //     // 1. Create record
  //     const result = await tx.SaleItem.create({ data });
  //
  //     // 2. Update related records
  //     // await tx.relatedModel.update(...);
  //
  //     // 3. Invalidate cache
  //     await this.redis.del('cache:sale-item:*');
  //
  //     return result;
  //   });
  // }
  // ═══════════════════════════════════════════════════════════════════
}
