import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateSalesPersonDto, UpdateSalesPersonDto } from './dto/sales-person.dto';

@Injectable()
export class SalesPersonService {
  private readonly CACHE_PREFIX = 'sales_people';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['code', 'name', 'phone', 'email'],
      allowedIncludes: ['sales'],
      defaultOrderBy: { id: 'asc' },
    });

    const findArgs: Record<string, unknown> = {
      where: prismaQuery.where,
      orderBy: prismaQuery.orderBy,
      skip: prismaQuery.skip,
      take: prismaQuery.take,
    };

    if (prismaQuery.select) {
      findArgs.select = prismaQuery.select;
    } else if (prismaQuery.include) {
      findArgs.include = prismaQuery.include;
    }

    const [data, total] = await Promise.all([
      this.prisma.salesPerson.findMany(findArgs as Parameters<typeof this.prisma.salesPerson.findMany>[0]),
      this.prisma.salesPerson.count({ where: prismaQuery.where }),
    ]);

    return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  async findOne(id: number) {
    const salesPerson = await this.prisma.salesPerson.findUnique({
      where: { id },
      include: {
        sales: {
          include: {
            customer: true,
            saleItems: { include: { product: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });
    if (!salesPerson) throw new NotFoundException('Sales person not found');
    return salesPerson;
  }

  async create(dto: CreateSalesPersonDto) {
    const existing = await this.prisma.salesPerson.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Sales person code already exists');

    return this.prisma.salesPerson.create({ data: dto });
  }

  async update(id: number, dto: UpdateSalesPersonDto) {
    const salesPerson = await this.prisma.salesPerson.findUnique({ where: { id } });
    if (!salesPerson) throw new NotFoundException('Sales person not found');

    if (dto.code && dto.code !== salesPerson.code) {
      const existing = await this.prisma.salesPerson.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException('Sales person code already exists');
    }

    return this.prisma.salesPerson.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const salesPerson = await this.prisma.salesPerson.findUnique({ where: { id } });
    if (!salesPerson) throw new NotFoundException('Sales person not found');

    return this.prisma.salesPerson.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats(id: number, dateFrom?: Date, dateTo?: Date) {
    const salesPerson = await this.prisma.salesPerson.findUnique({ where: { id } });
    if (!salesPerson) throw new NotFoundException('Sales person not found');

    const whereClause: Record<string, unknown> = { salesPersonId: id };
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) (whereClause.createdAt as Record<string, unknown>).gte = dateFrom;
      if (dateTo) (whereClause.createdAt as Record<string, unknown>).lte = dateTo;
    }

    const sales = await this.prisma.sale.findMany({
      where: whereClause,
      include: { saleItems: true },
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalPaid = sales.reduce((sum, s) => sum + Number(s.paid), 0);
    const totalItems = sales.reduce((sum, s) => sum + s.saleItems.length, 0);

    return {
      salesPerson,
      stats: {
        totalSales,
        totalRevenue,
        totalPaid,
        totalItems,
        salesByStatus: {
          PENDING: sales.filter((s) => s.paymentStatus === 'PENDING').length,
          PAID: sales.filter((s) => s.paymentStatus === 'PAID').length,
          PARTIAL: sales.filter((s) => s.paymentStatus === 'PARTIAL').length,
          INSTALMENT: sales.filter((s) => s.paymentStatus === 'INSTALMENT').length,
          CANCELLED: sales.filter((s) => s.paymentStatus === 'CANCELLED').length,
        },
      },
    };
  }
}
