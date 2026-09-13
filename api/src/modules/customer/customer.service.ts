import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateCustomerDto, UpdateCustomerDto, AdjustPointsDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  private readonly CACHE_PREFIX = 'customers';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['code', 'name', 'phone', 'email', 'address'],
      allowedIncludes: ['sales', 'customerDeposits', 'pointRedemptions'],
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
      this.prisma.customer.findMany(findArgs as Parameters<typeof this.prisma.customer.findMany>[0]),
      this.prisma.customer.count({ where: prismaQuery.where }),
    ]);

    return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  async findOne(id: number) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        sales: true,
        customerDeposits: true,
        pointRedemptions: true,
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(dto: CreateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Customer code already exists');

    return this.prisma.customer.create({ data: dto });
  }

  async update(id: number, dto: UpdateCustomerDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    if (dto.code && dto.code !== customer.code) {
      const existing = await this.prisma.customer.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException('Customer code already exists');
    }

    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    return this.prisma.customer.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async adjustPoints(id: number, dto: AdjustPointsDto) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    const newBalance = customer.pointBalance + dto.points;
    if (newBalance < 0) {
      throw new BadRequestException('Point balance cannot be negative');
    }

    return this.prisma.customer.update({
      where: { id },
      data: { pointBalance: newBalance },
    });
  }

  async getPointsHistory(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    // Note: SalePoint tracks points per customer transaction
    // We query via the sales relation to get transaction history
    const [sales, redemptions] = await Promise.all([
      this.prisma.sale.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      this.prisma.pointRedemption.findMany({
        where: { customerId: id },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      currentBalance: customer.pointBalance,
      recentSales: sales,
      redemptions,
    };
  }

  async getStats(id: number) {
    const customer = await this.prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');

    const [sales, customerDeposits, redemptions] = await Promise.all([
      this.prisma.sale.findMany({
        where: { customerId: id },
        include: { saleItems: true, salePayments: true },
      }),
      this.prisma.customerDeposit.findMany({ where: { customerId: id } }),
      this.prisma.pointRedemption.findMany({ where: { customerId: id } }),
    ]);

    const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);
    const totalPaid = sales.reduce((sum, s) => sum + s.salePayments.reduce((p, pay) => p + Number(pay.amount), 0), 0);
    const totalOutstanding = totalSales - totalPaid;
    const totalDeposits = customerDeposits.reduce((sum, d) => sum + Number(d.amount), 0);
    const totalRedeemed = redemptions.reduce((sum, r) => sum + r.pointsRedeemed, 0);

    return {
      customer,
      stats: {
        totalSales: sales.length,
        totalSalesAmount: totalSales,
        totalPaid,
        totalOutstanding,
        totalDeposits,
        totalRedeemed,
        currentPointBalance: customer.pointBalance,
      },
    };
  }
}
