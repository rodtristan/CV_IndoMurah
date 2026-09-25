import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { AutoJournalService, REF, Tx } from '../../common/accounting/auto-journal.service';
import { CreateCashTransferDto, UpdateCashTransferDto } from './dto/cash-transfer.dto';

const r2 = (n: number) => Math.round((Number(n) || 0) * 100) / 100;

@Injectable()
export class CashTransferService extends BaseService<
  any,
  CreateCashTransferDto,
  UpdateCashTransferDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
    private readonly autoJournal: AutoJournalService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'cashTransfer',
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
  // BUSINESS LOGIC — Kas Transfer: Dr akun tujuan / Cr akun asal (jurnal CASH_TRANSFER)
  // ═══════════════════════════════════════════════════════════════════

  private async validate(fromId: number, toId: number, amount: number) {
    if (!fromId || !toId) throw new BadRequestException('Akun asal dan tujuan wajib dipilih');
    if (fromId === toId) throw new BadRequestException('Akun asal dan tujuan tidak boleh sama');
    if (!(amount > 0)) throw new BadRequestException('Jumlah harus lebih dari 0');
    const found = await this.prisma.account.count({ where: { ID: { in: [fromId, toId] } } });
    if (found !== 2) throw new BadRequestException('Ada perkiraan yang tidak ditemukan');
  }

  private async post(tx: Tx, doc: any, userId: string) {
    const desc = `Kas Transfer ${doc.Code}${doc.Description ? ` - ${doc.Description}` : ''}`;
    await this.autoJournal.post(tx, {
      referenceType: REF.CASH_TRANSFER, referenceId: doc.ID, date: doc.Date, description: desc, userId, referenceNumber: doc.Code,
      lines: [
        { accountId: doc.ToAccountID, debit: Number(doc.Amount) },
        { accountId: doc.FromAccountID, credit: Number(doc.Amount) },
      ],
    });
  }

  async createDoc(dto: CreateCashTransferDto, userId: string) {
    const amount = r2(dto.amount);
    await this.validate(dto.fromAccountId, dto.toAccountId, amount);
    const date = dto.date ? new Date(dto.date) : new Date();
    const doc = await this.prisma.$transaction(async (tx) => {
      const d = await tx.cashTransfer.create({
        data: {
          Code: dto.code || `KT-${new Date().toISOString().replace(/\D/g, '').slice(0, 14)}`,
          Date: date, FromAccountID: dto.fromAccountId, ToAccountID: dto.toAccountId,
          Amount: new Prisma.Decimal(amount.toFixed(2)), Description: dto.description ?? null, CreatedByID: userId,
        },
      });
      await this.post(tx, d, userId);
      return d;
    });
    await this.afterWrite();
    return doc;
  }

  async updateDoc(id: number, dto: UpdateCashTransferDto, userId: string) {
    const ex = await this.prisma.cashTransfer.findUnique({ where: { ID: id } });
    if (!ex) throw new NotFoundException('Kas Transfer tidak ditemukan');
    const fromId = dto.fromAccountId ?? ex.FromAccountID;
    const toId = dto.toAccountId ?? ex.ToAccountID;
    const amount = dto.amount !== undefined ? r2(dto.amount) : Number(ex.Amount);
    await this.validate(fromId, toId, amount);
    const doc = await this.prisma.$transaction(async (tx) => {
      const d = await tx.cashTransfer.update({
        where: { ID: id },
        data: {
          ...(dto.code ? { Code: dto.code } : {}),
          ...(dto.date ? { Date: new Date(dto.date) } : {}),
          FromAccountID: fromId, ToAccountID: toId, Amount: new Prisma.Decimal(amount.toFixed(2)),
          ...(dto.description !== undefined ? { Description: dto.description } : {}),
        },
      });
      await this.post(tx, d, userId);
      return d;
    });
    await this.afterWrite();
    return doc;
  }

  async deleteDoc(id: number) {
    const ex = await this.prisma.cashTransfer.findUnique({ where: { ID: id } });
    if (!ex) throw new NotFoundException('Kas Transfer tidak ditemukan');
    const r = await this.prisma.$transaction(async (tx) => {
      await this.autoJournal.reverse(tx, REF.CASH_TRANSFER, id);
      return tx.cashTransfer.delete({ where: { ID: id } });
    });
    await this.afterWrite();
    return r;
  }

  private async afterWrite() {
    await this.invalidateCache();
    await this.redis.invalidatePattern('journal:*');
  }
}
