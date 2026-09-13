import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateCashTransferDto, UpdateCashTransferDto } from './dto/cash-transfer.dto';

@Injectable()
export class CashTransferService {
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
      this.prisma.cashTransfer.findMany({
        where: q.where,
        orderBy: q.orderBy,
        skip: q.skip,
        take: q.take,
        include: {
          fromAccount: true,
          toAccount: true,
          creator: { select: { id: true, name: true } },
        },
      }),
      this.prisma.cashTransfer.count({ where: q.where }),
    ]);

    return { data, total, skip: q.skip, take: q.take };
  }

  async findOne(id: number) {
    const data = await this.prisma.cashTransfer.findUnique({
      where: { id },
      include: {
        fromAccount: true,
        toAccount: true,
        creator: { select: { id: true, name: true } },
      },
    });
    if (!data) throw new NotFoundException('Cash Transfer not found');
    return data;
  }

  async create(dto: CreateCashTransferDto, userId: string) {
    const lastRecord = await this.prisma.cashTransfer.findFirst({ orderBy: { id: 'desc' } });
    const nextNumber = (lastRecord?.id || 0) + 1;
    const code = `CT-${String(nextNumber).padStart(6, '0')}`;

    return this.prisma.cashTransfer.create({
      data: {
        code,
        date: new Date(dto.date),
        fromAccountId: dto.from_account_id,
        toAccountId: dto.to_account_id,
        amount: dto.amount,
        description: dto.notes,
        createdById: userId,
      },
    });
  }

  async update(id: number, dto: UpdateCashTransferDto) {
    await this.findOne(id);
    return this.prisma.cashTransfer.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.from_account_id && { fromAccountId: dto.from_account_id }),
        ...(dto.to_account_id && { toAccountId: dto.to_account_id }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.notes !== undefined && { description: dto.notes }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cashTransfer.delete({ where: { id } });
  }
}
