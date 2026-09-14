import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateStockInDto, UpdateStockInDto } from './dto/stockIn.dto';

@Injectable()
export class StockInService extends BaseService<
  any,
  CreateStockInDto,
  UpdateStockInDto
> {
  constructor(
    prisma: PrismaService,
    redis: RedisService,
    queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'stockIn',
      primaryKey: 'id',
      searchableFields: ['name'],
      allowedIncludes: [],
      allowedSortFields: ['id', 'code', 'name', 'createdAt'],
      allowedSelectFields: ['id', 'code', 'name', 'isActive'],
      defaultOrderBy: { id: 'asc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: true,
      softDeleteField: 'isActive',
    });
  }
}
