import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma-service';
import { number } from '../../../common/utils/number';
import {
  CreateSalesPersonDto,
  UpDateSalesPersonDto,
  SalesPersonFilterDto,
  SalesPersonPerformanceDto,
} from './Salesperson.dto';

@Injectable()
export class SalesPersonService {
  constructor(private prisma: PrismaService) {}

  async createSalesPerson(dto: CreateSalesPersonDto, UserId: string) {
    const existing = await this.prisma.salesPerson.findUnique({
      where: { Code: dto.Code },
    });

    if (existing) {
      throw new BadRequestException(`Sales person Code '${dto.Code}' already exists`);
    }

    const SalesPerson = await this.prisma.salesPerson.create({
      data: {
        Code: dto.Code,
        Name: dto.Name,
        Phone: dto.Phone,
        Email: dto.Email,
        Address: dto.Address,
      },
    });

    await this.prisma.activityLog.create({
      data: {
        Type: 'SALESPERSON_CREATED',
        Title: 'Sales Person Created',
        Description: `New Sales person ${SalesPerson.Name} created`,
        ReferenceType: 'SALESPERSON',
        ReferenceID: SalesPerson.ID,
        CreatedByID: UserId,
      },
    });

    return {
      success: true,
      SalesPerson: this.formatSalesPerson(SalesPerson),
    };
  }

  async updateSalesPerson(SalesPersonId: number, dto: UpDateSalesPersonDto, UserId: string) {
    const SalesPerson = await this.prisma.salesPerson.findUnique({
      where: { ID: SalesPersonId },
    });

    if (!SalesPerson) {
      throw new NotFoundException('Sales person not found');
    }

    const updated = await this.prisma.salesPerson.update({
      where: { ID: SalesPersonId },
      data: {
        Name: dto.Name,
        Phone: dto.Phone,
        Email: dto.Email,
        Address: dto.Address,
        IsActive: dto.IsActive,
      },
    });

    return {
      success: true,
      SalesPerson: this.formatSalesPerson(updated),
    };
  }

  async getSalesPerson(SalesPersonId: number) {
    const SalesPerson = await this.prisma.salesPerson.findUnique({
      where: { ID: SalesPersonId },
      include: {
        Sales: {
          take: 10,
          orderBy: { Date: 'desc' },
          include: {
            Customer: true,
          },
        },
      },
    });

    if (!SalesPerson) {
      throw new NotFoundException('Sales person not found');
    }

    const TotalSales = SalesPerson.Sales.reduce((sum, s) => sum + Number(s.Total), 0);

    return {
      ...this.formatSalesPerson(SalesPerson),
      TotalSales,
      transactionCount: SalesPerson.Sales.length,
      recentSales: SalesPerson.Sales.map((s) => ({
        ID: s.ID,
        Code: s.Code,
        Date: s.Date,
        Total: number(s.Total),
        Customer: s.Customer?.Name,
      })),
    };
  }

  async listSalesPersons(dto: SalesPersonFilterDto) {
    const where: any = {};

    if (dto.Search) {
      where.OR = [
        { Name: { contains: dto.Search, mode: 'insensitive' } },
        { Code: { contains: dto.Search, mode: 'insensitive' } },
        { Phone: { contains: dto.Search, mode: 'insensitive' } },
      ];
    }

    if (dto.IsActive !== undefined) {
      where.IsActive = dto.IsActive;
    }

    const SalesPersons = await this.prisma.salesPerson.findMany({
      where,
      include: {
        _count: {
          select: { Sales: true },
        },
      },
      orderBy: { Name: 'asc' },
    });

    return SalesPersons.map((sp) => ({
      ...this.formatSalesPerson(sp),
      SalesCount: sp._count.Sales,
    }));
  }

  async deleteSalesPerson(SalesPersonId: number) {
    const SalesPerson = await this.prisma.salesPerson.findUnique({
      where: { ID: SalesPersonId },
    });

    if (!SalesPerson) {
      throw new NotFoundException('Sales person not found');
    }

    const SalesCount = await this.prisma.sale.count({
      where: { SalesPersonID: SalesPersonId },
    });

    if (SalesCount > 0) {
      await this.prisma.salesPerson.update({
        where: { ID: SalesPersonId },
        data: { IsActive: false },
      });
      return { success: true, message: 'Sales person deactivated' };
    }

    await this.prisma.salesPerson.delete({
      where: { ID: SalesPersonId },
    });

    return { success: true, message: 'Sales person deleted' };
  }

  async getSalesPersonPerformance(dto: SalesPersonPerformanceDto) {
    const where: any = {};

    if (dto.StartDate || dto.EndDate) {
      where.Date = {};
      if (dto.StartDate) {
        where.Date.gte = new Date(dto.StartDate);
      }
      if (dto.EndDate) {
        where.Date.lte = new Date(dto.EndDate);
      }
    }

    const SalesPersons = await this.prisma.salesPerson.findMany({
      where: { IsActive: true },
      include: {
        Sales: {
          where,
          select: {
            Total: true,
            ID: true,
          },
        },
      },
    });

    const performance = SalesPersons
      .map((sp) => ({
        SalesPersonId: sp.ID,
        SalesPersonCode: sp.Code,
        SalesPersonName: sp.Name,
        TotalSales: sp.Sales.reduce((sum, s) => sum + Number(s.Total), 0),
        transactionCount: sp.Sales.length,
        averageTransaction: sp.Sales.length > 0
          ? sp.Sales.reduce((sum, s) => sum + Number(s.Total), 0) / sp.Sales.length
          : 0,
      }))
      .filter((p) => p.transactionCount > 0)
      .sort((a, b) => b.TotalSales - a.TotalSales)
      .slice(0, dto.Limit || 10);

    return {
      period: { startDate: dto.StartDate, endDate: dto.EndDate },
      performance,
    };
  }

  private formatSalesPerson(SalesPerson: any) {
    return {
      ID: SalesPerson.ID,
      Code: SalesPerson.Code,
      Name: SalesPerson.Name,
      phone: SalesPerson.Phone,
      email: SalesPerson.Email,
      address: SalesPerson.Address,
      IsActive: SalesPerson.IsActive,
      createdAt: SalesPerson.CreatedAt,
    };
  }
}
