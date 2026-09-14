import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateCashTransferDto, UpdateCashTransferDto } from './dto/cash-transfer.dto';

@Injectable()
export class CashTransferService extends BaseService<
  any,
  CreateCashTransferDto,
  UpdateCashTransferDto
> {
  constructor(
    prisma: PrismaService,
    redis: RedisService,
    queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'cash-transfer',
      primaryKey: 'id',
      searchableFields: ['code', 'description'],
      allowedIncludes: ['fromAccount', 'toAccount'],
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
