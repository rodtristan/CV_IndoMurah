import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { accountBalances } from '../../common/accounting/ledger';
import { CreateAccountDto, UpdateAccountDto } from './dto/account.dto';

@Injectable()
export class AccountService extends BaseService<
  any,
  CreateAccountDto,
  UpdateAccountDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'account',
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

  /**
   * Account.Balance is NOT maintained on posting. The balance is always computed from the ledger
   * (posted journal lines + opening balances — same definition as the finance reports) and overlaid
   * on API responses, so every screen that shows Balance shows the ledger value.
   */
  async balances(asOf?: Date) {
    const map = await accountBalances(this.prisma, asOf);
    return [...map.values()];
  }

  async overlayBalance<T>(rows: T): Promise<T> {
    const list: any[] = Array.isArray(rows) ? rows : rows ? [rows] : [];
    if (!list.some((r) => r && typeof r === 'object' && 'ID' in r)) return rows;
    const map = await accountBalances(this.prisma);
    for (const r of list) {
      if (r && typeof r === 'object' && 'ID' in r) r.Balance = map.get(r.ID)?.balance ?? 0;
    }
    return rows;
  }
}
