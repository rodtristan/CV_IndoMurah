import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateCashInDto, UpdateCashInDto } from './dto/cash-in.dto';

@Injectable()
export class CashInService {
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
      this.prisma.cashIn.findMany({
        where: q.where,
        orderBy: q.orderBy,
        skip: q.skip,
        take: q.take,
        include: { account: true, creator: { select: { id: true, name: true } } },
      }),
      this.prisma.cashIn.count({ where: q.where }),
    ]);

    return { data, total, skip: q.skip, take: q.take };
  }

  async findOne(id: number) {
    const data = await this.prisma.cashIn.findUnique({
      where: { id },
      include: { account: true, creator: { select: { id: true, name: true } } },
    });
    if (!data) throw new NotFoundException('Cash In not found');
    return data;
  }

  async create(dto: CreateCashInDto, userId: string) {
    const lastRecord = await this.prisma.cashIn.findFirst({ orderBy: { id: 'desc' } });
    const nextNumber = (lastRecord?.id || 0) + 1;
    const code = `CI-${String(nextNumber).padStart(6, '0')}`;

    return this.prisma.cashIn.create({
      data: {
        code,
        date: new Date(dto.date),
        accountId: dto.account_id,
        description: dto.description,
        amount: dto.amount,
        referenceId: dto.reference ? parseInt(dto.reference, 10) : null,
        createdById: userId,
      },
    });
  }

  async update(id: number, dto: UpdateCashInDto) {
    await this.findOne(id);
    return this.prisma.cashIn.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.account_id && { accountId: dto.account_id }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.reference !== undefined && { referenceId: dto.reference ? parseInt(dto.reference, 10) : null }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cashIn.delete({ where: { id } });
  }
}
