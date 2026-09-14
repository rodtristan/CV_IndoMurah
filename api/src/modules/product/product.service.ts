import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductService extends BaseService<
  any,
  CreateProductDto,
  UpdateProductDto
> {
  constructor(
    prisma: PrismaService,
    redis: RedisService,
    queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'product',
      primaryKey: 'id',
      searchableFields: ['code', 'barcode', 'name', 'description'],
      allowedIncludes: ['category', 'unit', 'brand', 'warehouse', 'productStocks'],
      allowedSortFields: ['id', 'code', 'name', 'createdAt'],
      allowedSelectFields: ['id', 'code', 'barcode', 'name', 'purchasePrice', 'sellingPrice', 'stock', 'isActive'],
      defaultOrderBy: { id: 'asc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: true,
      softDeleteField: 'isActive',
    });
  }
}
