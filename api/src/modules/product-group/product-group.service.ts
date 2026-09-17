import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateProductGroupDto, UpdateProductGroupDto } from './dto/product-group.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductGroupService extends BaseService<
  any,
  CreateProductGroupDto,
  UpdateProductGroupDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'product-group',
      primaryKey: 'id',
      // Use '*' to allow all fields (searchable, sortable, selectable, includable)
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { createdAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: true,
      softDeleteField: 'isActive',
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════
  // Tambahkan method bisnis logic di sini
  // Contoh:
  //
  // async processTransaction(data: CreateProductGroupDto, userId: string) {
  //   return this.prisma.$transaction(async (tx) => {
  //     // 1. Create record
  //     const result = await tx.ProductGroup.create({ data });
  //
  //     // 2. Update related records
  //     // await tx.relatedModel.update(...);
  //
  //     // 3. Invalidate cache
  //     await this.redis.del('cache:product-group:*');
  //
  //     return result;
  //   });
  // }
  // ═══════════════════════════════════════════════════════════════════
}
