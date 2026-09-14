import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Injectable()
export class AccountService extends BaseService<
  any,
  CreateAccountDto,
  UpdateAccountDto
> {
  constructor(
    prisma: PrismaService,
    redis: RedisService,
    queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'account',
      primaryKey: 'id',
      searchableFields: ['code', 'name'],
      allowedIncludes: ['parent', 'children'],
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
