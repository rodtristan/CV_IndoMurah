import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateJournalDto, UpdateJournalDto } from './dto/journal.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class JournalService extends BaseService<
  any,
  CreateJournalDto,
  UpdateJournalDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'journal',
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
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════

  async createJournal(dto: CreateJournalDto, userId: string): Promise<any> {
    if (!dto.entries || dto.entries.length === 0) {
      throw new BadRequestException('Jurnal harus memiliki minimal 1 baris debit/kredit');
    }

    const totalDebit = dto.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
    const totalCredit = dto.entries.reduce((sum, e) => sum + (e.credit || 0), 0);
    if (Math.round(totalDebit * 100) !== Math.round(totalCredit * 100)) {
      throw new BadRequestException(
        `Jurnal tidak balance: total debit ${totalDebit} tidak sama dengan total kredit ${totalCredit}`,
      );
    }

    const code = await this.generateCode();

    const journal = await this.prisma.$transaction(async (tx) => {
      return tx.journal.create({
        data: {
          Code: code,
          Date: dto.date ? new Date(dto.date) : new Date(),
          Description: dto.description,
          ReferenceType: dto.referenceType,
          ReferenceID: dto.referenceId,
          IsPosted: true,
          PostedAt: new Date(),
          CreatedByID: userId,
          JournalEntries: {
            create: {
              JournalNumber: code,
              Description: dto.description,
              TotalDebit: new Prisma.Decimal(totalDebit),
              TotalCredit: new Prisma.Decimal(totalCredit),
              Status: 'POSTED',
              CreatedByID: userId,
              Lines: {
                create: dto.entries.map((e, index) => ({
                  AccountID: e.accountId,
                  Debit: new Prisma.Decimal(e.debit || 0),
                  Credit: new Prisma.Decimal(e.credit || 0),
                  Description: e.memo,
                  LineNumber: index + 1,
                  CreatedByID: userId,
                })),
              },
            },
          },
        },
        include: { JournalEntries: { include: { Lines: { include: { Account: true } } } }, Creator: true },
      });
    });

    await this.invalidateCache();
    return journal;
  }

  private async generateCode(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const prefix = `JR-${year}${month}`;

    const lastJournal = await this.prisma.journal.findFirst({
      where: { Code: { startsWith: prefix } },
      orderBy: { Code: 'desc' },
      select: { Code: true },
    });

    let nextNumber = 1;
    if (lastJournal) {
      const lastSeq = parseInt(lastJournal.Code.split('-').pop() || '0', 10);
      nextNumber = lastSeq + 1;
    }

    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }
}
