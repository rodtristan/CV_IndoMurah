import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { QueryService } from '../../common/query/query-service';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SupplierService {
  private readonly CACHE_PREFIX = 'suppliers';
  private readonly CACHE_TTL = 60;

  constructor(
    private prisma: PrismaService,
    private queryService: QueryService,
  ) {}

  async findAll(query: Record<string, unknown>) {
    const prismaQuery = this.queryService.buildPrismaQuery(query, {
      searchableFields: ['code', 'name', 'phone', 'email', 'contactPerson'],
      allowedIncludes: ['purchaseOrders', 'purchases', 'stockIns', 'supplierDeposits', 'purchaseReturns'],
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
      this.prisma.supplier.findMany(findArgs as Parameters<typeof this.prisma.supplier.findMany>[0]),
      this.prisma.supplier.count({ where: prismaQuery.where }),
    ]);

    return { data, total, skip: prismaQuery.skip, take: prismaQuery.take };
  }

  async findOne(id: number) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        purchaseOrders: true,
        purchases: true,
        stockIns: true,
        supplierDeposits: true,
        purchaseReturns: true,
      },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(dto: CreateSupplierDto) {
    const existing = await this.prisma.supplier.findUnique({ where: { code: dto.code } });
    if (existing) throw new ConflictException('Supplier code already exists');

    return this.prisma.supplier.create({ data: dto });
  }

  async update(id: number, dto: UpdateSupplierDto) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    if (dto.code && dto.code !== supplier.code) {
      const existing = await this.prisma.supplier.findUnique({ where: { code: dto.code } });
      if (existing) throw new ConflictException('Supplier code already exists');
    }

    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getStats(id: number) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');

    const [purchases, purchaseOrders, purchaseReturns, supplierDeposits] = await Promise.all([
      this.prisma.purchase.findMany({
        where: { supplierId: id },
        include: { purchaseItems: true },
      }),
      this.prisma.purchaseOrder.findMany({ where: { supplierId: id } }),
      this.prisma.purchaseReturn.findMany({ where: { supplierId: id } }),
      this.prisma.supplierDeposit.findMany({ where: { supplierId: id } }),
    ]);

    const totalPurchases = purchases.reduce((sum, p) => sum + Number(p.total), 0);
    const totalPaid = purchases.reduce((sum, p) => sum + Number(p.paid), 0);
    const totalDebt = purchases.reduce((sum, p) => sum + Number(p.remaining), 0);
    const totalReturns = purchaseReturns.reduce((sum, r) => sum + Number(r.totalReturn), 0);
    const totalDeposits = supplierDeposits.reduce((sum, d) => sum + Number(d.amount), 0);

    return {
      supplier,
      stats: {
        totalPurchases: purchases.length,
        totalOrders: purchaseOrders.length,
        totalDebt,
        totalPaid,
        totalReturns,
        totalDeposits,
        totalPurchaseAmount: totalPurchases,
      },
    };
  }
}
