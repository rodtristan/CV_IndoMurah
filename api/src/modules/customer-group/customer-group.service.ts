import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateCustomerGroupDto, UpdateCustomerGroupDto } from './dto/customer-group.dto';

@Injectable()
export class CustomerGroupService extends BaseService<
  any,
  CreateCustomerGroupDto,
  UpdateCustomerGroupDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'customerGroup',
      primaryKey: 'ID',
      searchableFields: ['code', 'name', 'description'],
      allowedIncludes: ['customers'],
      allowedSortFields: ['code', 'name', 'sortOrder', 'createdAt'],
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
