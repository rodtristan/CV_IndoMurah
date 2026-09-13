import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateSupplierDepositDto, UpdateSupplierDepositDto } from './dto/supplier-deposit.dto';

@Injectable()
export class SupplierDepositService {
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
      this.prisma.supplierDeposit.findMany({
        where: q.where,
        orderBy: q.orderBy,
        skip: q.skip,
        take: q.take,
        include: { supplier: true, creator: { select: { id: true, name: true } } },
      }),
      this.prisma.supplierDeposit.count({ where: q.where }),
    ]);

    return { data, total, skip: q.skip, take: q.take };
  }

  async findOne(id: number) {
    const data = await this.prisma.supplierDeposit.findUnique({
      where: { id },
      include: { supplier: true, creator: { select: { id: true, name: true } } },
    });
    if (!data) throw new NotFoundException('Supplier Deposit not found');
    return data;
  }

  async create(dto: CreateSupplierDepositDto, userId: string) {
    const lastRecord = await this.prisma.supplierDeposit.findFirst({ orderBy: { id: 'desc' } });
    const nextNumber = (lastRecord?.id || 0) + 1;
    const code = `SD-${String(nextNumber).padStart(6, '0')}`;

    return this.prisma.supplierDeposit.create({
      data: {
        code,
        date: new Date(dto.date),
        supplierId: dto.supplier_id,
        amount: dto.amount,
        remainingAmount: dto.amount,
        description: dto.description,
        createdById: userId,
      },
    });
  }

  async update(id: number, dto: UpdateSupplierDepositDto) {
    await this.findOne(id);
    return this.prisma.supplierDeposit.update({
      where: { id },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.supplier_id && { supplierId: dto.supplier_id }),
        ...(dto.amount !== undefined && { amount: dto.amount }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.supplierDeposit.delete({ where: { id } });
  }
}
