import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateSalesPersonDto, UpdateSalesPersonDto } from './dto/sales-person.dto';

@Injectable()
export class SalesPersonService extends BaseService<
  any,
  CreateSalesPersonDto,
  UpdateSalesPersonDto
> {
  constructor(
    prisma: PrismaService,
    redis: RedisService,
    queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'salesPerson',
      primaryKey: 'id',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { id: 'asc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: true,
      softDeleteField: 'isActive',
    });
  }
}
