import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateSubRegionDto, UpdateSubRegionDto } from './dto/sub-region.dto';

@Injectable()
export class SubRegionService extends BaseService<
  any,
  CreateSubRegionDto,
  UpdateSubRegionDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'subRegion',
      primaryKey: 'ID',
      searchableFields: ['code', 'name', 'description'],
      allowedIncludes: ['region', 'region.*', 'shippingCosts'],
      allowedSortFields: ['code', 'name', 'sortOrder', 'createdAt'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { SortOrder: 'asc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: true,
      softDeleteField: 'IsActive',
    });
  }
}
