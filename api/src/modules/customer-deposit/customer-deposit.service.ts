import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateCustomerDepositDto, UpdateCustomerDepositDto } from './dto/customer-deposit.dto';

@Injectable()
export class CustomerDepositService {
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
      this.prisma.customerDeposit.findMany({
        where: q.where,
        orderBy: q.orderBy,
        skip: q.skip,
        take: q.take,
        include: { customer: true, creator: { select: { id: true, name: true } } },
      }),
      this.prisma.customerDeposit.count({ where: q.where }),
    ]);

    return { data, total, skip: q.skip, take: q.take };
  }

  async findOne(id: number) {
    const data = await this.prisma.customerDeposit.findUnique({
      where: { id },
      include: { customer: true, creator: { select: { id: true, name: true } } },
    });
    if (!data) throw new NotFoundException('Customer Deposit not found');
    return data;
  }

  async create(dto: CreateCustomerDepositDto, userId: string) {
    const lastRecord = await this.prisma.customerDeposit.findFirst({ orderBy: { id: 'desc' } });
    const nextNumber = (lastRecord?.id || 0) + 1;
    const code = `CD-${String(nextNumber).padStart(6, '0')}`;

    return this.prisma.customerDeposit.create({
      data: {
        code,
        date: new Date(dto.date),
        customerId: dto.customer_id,
        amount: dto.amount,
        remainingAmount: dto.amount,
        description: dto.description,
        createdById: userId,
      },
    });
  }

  async update(id: number, dto: UpdateCustomerDepositDto) {
    await this.findOne(id);
    return this.prisma.customerDeposit.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.customer_id && { customerId: dto.customer_id }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.customerDeposit.delete({ where: { id } });
  }
}
