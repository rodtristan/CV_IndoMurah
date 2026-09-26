import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import type { ODataQuery } from '../../common/templates/model-metadata';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService extends BaseService<
  any,
  CreateCustomerDto,
  UpdateCustomerDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'customer',
      primaryKey: 'ID',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: true,
      softDeleteField: 'IsActive',
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════

  /** Daftar Pelanggan Ketoko menampilkan "Jml Transaksi" dan "Total Belanja" per pelanggan. */
  async findAll(query: ODataQuery = {}) {
    const result: any = await super.findAll(query);
    const rows: any[] = result?.data ?? [];
    const ids = rows.map((r) => r.ID).filter((v) => typeof v === 'number');
    if (!ids.length) return result;
    const stats = await this.prisma.sale.groupBy({
      by: ['CustomerID'],
      where: { CustomerID: { in: ids } },
      _count: { _all: true },
      _sum: { Total: true },
    });
    const byId = new Map(stats.map((s) => [s.CustomerID, s]));
    return {
      ...result,
      data: rows.map((r) => {
        const s = byId.get(r.ID);
        return { ...r, TransactionCount: s?._count._all ?? 0, TotalSpent: Number(s?._sum.Total ?? 0) };
      }),
    };
  }
}
