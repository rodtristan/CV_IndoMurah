import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { AutoJournalService } from '../../common/accounting/auto-journal.service';
import { CashDocHelper } from '../../common/accounting/cash-doc.helper';
import { CreateCashOutDto, UpdateCashOutDto } from './dto/cash-out.dto';

@Injectable()
export class CashOutService extends BaseService<
  any,
  CreateCashOutDto,
  UpdateCashOutDto
> {
  private readonly doc: CashDocHelper;

  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
    readonly autoJournal: AutoJournalService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'cashOut',
      primaryKey: 'ID',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: false,
    });
    this.doc = new CashDocHelper(prisma, autoJournal, 'out');
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC — every write posts / reverses the automatic journal (CASH_OUT)
  // ═══════════════════════════════════════════════════════════════════

  async createDoc(dto: CreateCashOutDto, userId: string) {
    const r = await this.doc.create(dto, userId);
    await this.afterWrite();
    return r;
  }

  async updateDoc(id: number, dto: UpdateCashOutDto, userId: string) {
    const r = await this.doc.update(id, dto, userId);
    await this.afterWrite();
    return r;
  }

  async deleteDoc(id: number) {
    const r = await this.doc.remove(id);
    await this.afterWrite();
    return r;
  }

  lines(id: number) {
    return this.doc.lines(id);
  }

  private async afterWrite() {
    await this.invalidateCache();
    await this.redis.invalidatePattern('journal:*');
  }
}
