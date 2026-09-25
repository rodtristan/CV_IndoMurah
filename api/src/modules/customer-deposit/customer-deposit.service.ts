import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { AutoJournalService } from '../../common/accounting/auto-journal.service';
import { DepositLedgerService } from '../../common/accounting/deposit-ledger.service';
import { DepositDocHelper } from '../../common/accounting/deposit-doc.helper';
import { CreateCustomerDepositDto, UpdateCustomerDepositDto } from './dto/customer-deposit.dto';

@Injectable()
export class CustomerDepositService extends BaseService<
  any,
  CreateCustomerDepositDto,
  UpdateCustomerDepositDto
> {
  private readonly doc: DepositDocHelper;

  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
    autoJournal: AutoJournalService,
    ledger: DepositLedgerService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'customerDeposit',
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
    this.doc = new DepositDocHelper(prisma, autoJournal, ledger, 'customer');
  }

  // Every write keeps RemainingAmount / Customer.DepositBalance consistent and posts/reverses the automatic journal.
  async createDoc(dto: CreateCustomerDepositDto, userId: string) {
    const r = await this.doc.create(dto, userId);
    await this.afterWrite();
    return r;
  }

  async updateDoc(id: number, dto: UpdateCustomerDepositDto, userId: string) {
    const r = await this.doc.update(id, dto, userId);
    await this.afterWrite();
    return r;
  }

  async deleteDoc(id: number) {
    const r = await this.doc.remove(id);
    await this.afterWrite();
    return r;
  }

  balance(partyId: number) {
    return this.doc.balance(partyId);
  }

  private async afterWrite() {
    await this.invalidateCache();
    await this.redis.invalidatePattern('journal:*');
    await this.redis.invalidatePattern('customer:*');
  }
}
