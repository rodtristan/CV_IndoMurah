import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateSalePointDto, UpdateSalePointDto } from './dto/sale-point.dto';

@Injectable()
export class SalePointService {
  private readonly CACHE_PREFIX = 'sale_points';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['code', 'name', 'description'],
      allowedIncludes: ['warehouse', 'sales'],
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
      this.prisma.salePoint.findMany(findArgs as Parameters<typeof this.prisma.salePoint.findMany>[0]),
      this.prisma.salePoint.count({ where: prismaQuery.where }),
    ]);

    return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  async findOne(id: number) {
    const salePoint = await this.prisma.salePoint.findUnique({
      where: { id },
      include: {
        warehouse: true,
        sales: true,
      },
    });
    if (!salePoint) throw new NotFoundException('Sale point not found');
    return salePoint;
  }

  async create(dto: CreateSalePointDto) {
    const existing = await this.prisma.salePoint.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Sale point code already exists');

    return this.prisma.salePoint.create({ data: dto });
  }

  async update(id: number, dto: UpdateSalePointDto) {
    const salePoint = await this.prisma.salePoint.findUnique({ where: { id } });
    if (!salePoint) throw new NotFoundException('Sale point not found');

    if (dto.code && dto.code !== salePoint.code) {
      const existing = await this.prisma.salePoint.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException('Sale point code already exists');
    }

    return this.prisma.salePoint.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const salePoint = await this.prisma.salePoint.findUnique({ where: { id } });
    if (!salePoint) throw new NotFoundException('Sale point not found');

    return this.prisma.salePoint.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getSales(id: number) {
    const salePoint = await this.prisma.salePoint.findUnique({ where: { id } });
    if (!salePoint) throw new NotFoundException('Sale point not found');

    return this.prisma.sale.findMany({
      where: { salePointId: id },
      include: {
        customer: true,
        salesPerson: true,
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStats(id: number, dateFrom?: Date, dateTo?: Date) {
    const salePoint = await this.prisma.salePoint.findUnique({ where: { id } });
    if (!salePoint) throw new NotFoundException('Sale point not found');

    const whereClause: Record<string, unknown> = { salePointId: id };
    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) (whereClause.createdAt as Record<string, unknown>).gte = dateFrom;
      if (dateTo) (whereClause.createdAt as Record<string, unknown>).lte = dateTo;
    }

    const [sales, totalSales, paidSales, pendingSales] = await Promise.all([
      this.prisma.sale.findMany({
        where: whereClause,
        include: { items: true },
      }),
      this.prisma.sale.count({ where: whereClause }),
      this.prisma.sale.count({ where: { ...whereClause, paymentStatus: 'PAID' } }),
      this.prisma.sale.count({ where: { ...whereClause, paymentStatus: 'PENDING' } }),
    ]);

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalPaid = sales.reduce((sum, s) => sum + Number(s.paid), 0);
    const totalItems = sales.reduce((sum, s) => sum + s.items.length, 0);

    return {
      salePoint,
      summary: {
        totalSales,
        paidSales,
        pendingSales,
        totalRevenue,
        totalPaid,
        totalItems,
      },
    };
  }
}
