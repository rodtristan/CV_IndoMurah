import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreatePointRedemptionDto, UpdatePointRedemptionDto } from './dto/point-redemption.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PointRedemptionService extends BaseService<
  any,
  CreatePointRedemptionDto,
  UpdatePointRedemptionDto
> {
  constructor(
    prisma: PrismaService,
    redis: RedisService,
    queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'pointRedemption',
      primaryKey: 'id',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { id: 'asc' },
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
  // async processTransaction(data: CreatePointRedemptionDto, userId: string) {
  //   return this.prisma.$transaction(async (tx) => {
  //     // 1. Create record
  //     const result = await tx.PointRedemption.create({ data });
  //
  //     // 2. Update related records
  //     // await tx.relatedModel.update(...);
  //
  //     // 3. Invalidate cache
  //     await this.redis.del('cache:point-redemption:*');
  //
  //     return result;
  //   });
  // }
  // ═══════════════════════════════════════════════════════════════════
}
