import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateJournalEntryDto, UpdateJournalEntryDto } from './dto/journal.dto';

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const q = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['code', 'description'],
      defaultOrderBy: { date: 'desc' },
    });

    const [data, total] = await Promise.all([
      this.prisma.journal.findMany({
        where: q.where,
        orderBy: q.orderBy,
        skip: q.skip,
        take: q.take,
        include: {
          journalEntries: { include: { account: true } },
          creator: { select: { id: true, name: true } },
        },
      }),
      this.prisma.journal.count({ where: q.where }),
    ]);

    return { data, total, skip: q.skip, take: q.take };
  }

  async findOne(id: number) {
    const data = await this.prisma.journal.findUnique({
      where: { id },
      include: {
        journalEntries: { include: { account: true } },
        creator: { select: { id: true, name: true } },
      },
    });
    if (!data) throw new NotFoundException('Journal not found');
    return data;
  }

  async create(dto: CreateJournalEntryDto, userId: string) {
    // Validate debit = credit
    let totalDebit = 0;
    let totalCredit = 0;
    for (const item of dto.items) {
      totalDebit += item.debit || 0;
      totalCredit += item.credit || 0;
    }

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException('Total debit must equal total credit');
    }

    const lastRecord = await this.prisma.journal.findFirst({ orderBy: { id: 'desc' } });
    const nextNumber = (lastRecord?.id || 0) + 1;
    const code = `JE-${String(nextNumber).padStart(6, '0')}`;

    return this.prisma.journal.create({
      data: {
        code,
        date: new Date(dto.date),
        description: dto.description,
        referenceType: dto.reference_type,
        referenceId: dto.reference_id,
        createdById: userId,
        journalEntries: {
          create: dto.items.map(item => ({
            accountId: item.account_id,
            debit: item.debit || 0,
            credit: item.credit || 0,
            memo: item.description,
          })),
        },
      },
      include: {
        journalEntries: { include: { account: true } },
      },
    });
  }

  async update(id: number, dto: UpdateJournalEntryDto) {
    const existing = await this.findOne(id);

    let totalDebit = 0;
    let totalCredit = 0;
    if (dto.items) {
      for (const item of dto.items) {
        totalDebit += item.debit || 0;
        totalCredit += item.credit || 0;
      }
      if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new BadRequestException('Total debit must equal total credit');
      }
    }

    return this.prisma.journal.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.reference_type !== undefined && { referenceType: dto.reference_type }),
        ...(dto.reference_id !== undefined && { referenceId: dto.reference_id }),
        ...(dto.items && {
          journalEntries: {
            deleteMany: {},
            create: dto.items.map(item => ({
              accountId: item.account_id,
              debit: item.debit || 0,
              credit: item.credit || 0,
              memo: item.description,
            })),
          },
        }),
      },
      include: {
        journalEntries: { include: { account: true } },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.journal.delete({ where: { id } });
  }
}
