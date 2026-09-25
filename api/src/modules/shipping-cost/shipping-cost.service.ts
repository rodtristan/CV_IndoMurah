import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateShippingCostDto, UpdateShippingCostDto } from './dto/shipping-cost.dto';

@Injectable()
export class ShippingCostService extends BaseService<
  any,
  CreateShippingCostDto,
  UpdateShippingCostDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'shippingCost',
      primaryKey: 'ID',
      searchableFields: ['code', 'name', 'description'],
      allowedIncludes: ['region', 'region.*', 'subRegion', 'subRegion.*'],
      allowedSortFields: ['code', 'name', 'cost', 'sortOrder', 'createdAt'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { sortOrder: 'asc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: true,
      softDeleteField: 'IsActive',
    });
  }
}
