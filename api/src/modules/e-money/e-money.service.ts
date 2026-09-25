import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateEMoneyDto, UpdateEMoneyDto } from './dto/e-money.dto';

@Injectable()
export class EMoneyService extends BaseService<
  any,
  CreateEMoneyDto,
  UpdateEMoneyDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'eMoney',
      primaryKey: 'ID',
      searchableFields: ['code', 'name', 'accountNumber'],
      allowedIncludes: [],
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
