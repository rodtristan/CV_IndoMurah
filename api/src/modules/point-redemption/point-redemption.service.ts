import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreatePointRedemptionDto, UpdatePointRedemptionDto } from './dto/point-redemption.dto';
import { Prisma } from '@prisma/client';
import { recalcCustomerPoints } from '../../common/sales/points';

@Injectable()
export class PointRedemptionService extends BaseService<
  any,
  CreatePointRedemptionDto,
  UpdatePointRedemptionDto
> {
  constructor(
    prisma: PrismaService,
    redis: RedisService,
    queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'pointRedemption',
      primaryKey: 'ID',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: false,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════
  // Mengambil point (redeem) mengurangi Customer.pointBalance; menghapus
  // pengambilan point mengembalikan balance-nya (lihat PointPenjualan1.html:
  // "Menghapus Point").

  async create(dto: CreatePointRedemptionDto & { createdById?: string }): Promise<any> {
    if (!(dto.pointsRedeemed > 0)) throw new BadRequestException('Jumlah point diambil harus lebih dari 0');
    const code = dto.code?.trim() || (await this.nextCode());
    const result = await this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { ID: dto.customerId } });
      if (!customer) throw new BadRequestException('Pelanggan tidak ditemukan');
      const balance = await recalcCustomerPoints(tx, dto.customerId);
      if (balance < dto.pointsRedeemed) throw new BadRequestException(`Sisa point pelanggan tidak cukup (sisa ${balance})`);
      const row = await tx.pointRedemption.create({
        data: {
          CustomerID: dto.customerId,
          Code: code,
          PointsRedeemed: dto.pointsRedeemed,
          RewardName: dto.rewardName?.trim() || 'Ambil Point',
          RewardValue: new Prisma.Decimal(dto.rewardValue ?? 0),
          Date: dto.date ? new Date(dto.date) : new Date(),
          Notes: dto.notes ?? null,
          CreatedByID: String(dto.createdById),
        },
      });
      await recalcCustomerPoints(tx, dto.customerId);
      return row;
    });
    await this.afterWrite();
    return result;
  }

  async deleteById(id: any): Promise<any> {
    const result = await this.prisma.$transaction(async (tx) => {
      const redemption = await tx.pointRedemption.findUnique({ where: { ID: Number(id) } });
      if (!redemption) throw new BadRequestException('Data ambil point tidak ditemukan');
      const row = await tx.pointRedemption.delete({ where: { ID: Number(id) } });
      await recalcCustomerPoints(tx, redemption.CustomerID);
      return row;
    });
    await this.afterWrite();
    return result;
  }

  /**
   * Point Penjualan pelanggan untuk satu periode (Ketoko): baris Saldo Awal (SA), point tiap faktur
   * penjualan (JL) dan pengambilan point (AP, negatif). Sisa Point = saldo akhir periode.
   */
  async ledger(customerId: number, from?: string, to?: string) {
    const customer = await this.prisma.customer.findUnique({ where: { ID: customerId }, select: { ID: true, Code: true, Name: true, PointOpening: true } });
    if (!customer) throw new BadRequestException('Pelanggan tidak ditemukan');
    const start = from ? new Date(`${from}T00:00:00+07:00`) : null;
    const end = to ? new Date(`${to}T23:59:59.999+07:00`) : null;
    const notCancelled = { PaymentStatus: { Code: { not: 'CANCELLED' } } };
    const [earnedBefore, redeemedBefore, sales, redemptions] = await Promise.all([
      start ? this.prisma.sale.aggregate({ where: { CustomerID: customerId, ...notCancelled, Date: { lt: start } }, _sum: { PointEarned: true } }) : null,
      start ? this.prisma.pointRedemption.aggregate({ where: { CustomerID: customerId, Date: { lt: start } }, _sum: { PointsRedeemed: true } }) : null,
      this.prisma.sale.findMany({
        where: { CustomerID: customerId, ...notCancelled, PointEarned: { gt: 0 }, Date: { ...(start ? { gte: start } : {}), ...(end ? { lte: end } : {}) } },
        select: { ID: true, Code: true, Date: true, Total: true, PointEarned: true },
        orderBy: { Date: 'asc' },
      }),
      this.prisma.pointRedemption.findMany({
        where: { CustomerID: customerId, Date: { ...(start ? { gte: start } : {}), ...(end ? { lte: end } : {}) } },
        orderBy: { Date: 'asc' },
      }),
    ]);
    const opening = customer.PointOpening + Number(earnedBefore?._sum.PointEarned ?? 0) - Number(redeemedBefore?._sum.PointsRedeemed ?? 0);
    const rows: any[] = [{ Key: 'SA', Code: 'Saldo Awal', Type: 'SA', Date: null, TotalTransaction: 0, Points: opening }];
    for (const s of sales) rows.push({ Key: `JL-${s.ID}`, ID: s.ID, Code: s.Code, Type: 'JL', Date: s.Date.toISOString(), TotalTransaction: Number(s.Total), Points: Number(s.PointEarned) });
    for (const r of redemptions) {
      rows.push({
        Key: `AP-${r.ID}`, ID: r.ID, Code: r.Code, Type: 'AP', Date: r.Date.toISOString(), TotalTransaction: Number(r.RewardValue),
        Points: -r.PointsRedeemed, Notes: r.Notes ?? r.RewardName,
      });
    }
    rows.sort((a, b) => (a.Type === 'SA' ? -1 : b.Type === 'SA' ? 1 : String(a.Date).localeCompare(String(b.Date))));
    const closing = rows.reduce((a, r) => a + r.Points, 0);
    return { customer, rows, opening, closing };
  }

  private async nextCode() {
    const d = new Date();
    const head = `AP-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}-`;
    const last = await this.prisma.pointRedemption.findFirst({ where: { Code: { startsWith: head } }, orderBy: { Code: 'desc' }, select: { Code: true } });
    const seq = last ? Number(last.Code.slice(head.length)) + 1 : 1;
    return `${head}${String(seq).padStart(4, '0')}`;
  }

  private async afterWrite() {
    await this.invalidateCache();
    await this.redis.invalidatePattern('customer:*');
  }
  // ═══════════════════════════════════════════════════════════════════
}
