import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreatePointRedemptionDto, UpdatePointRedemptionDto } from './dto/point-redemption.dto';
import { Prisma } from '@prisma/client';

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
      primaryKey: 'id',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { createdAt: 'desc' },
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

  async create(dto: CreatePointRedemptionDto): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: dto.customerId } });
      if (!customer) throw new BadRequestException('Pelanggan tidak ditemukan');
      if (customer.pointBalance < dto.pointsRedeemed) {
        throw new BadRequestException('Point pelanggan tidak cukup');
      }

      const result = await tx.pointRedemption.create({ data: dto as any });
      await tx.customer.update({
        where: { id: dto.customerId },
        data: { pointBalance: { decrement: dto.pointsRedeemed } },
      });

      await this.invalidateCache();
      await this.redis.invalidatePattern('customer:*');
      return result;
    });
  }

  async deleteById(id: any): Promise<any> {
    return this.prisma.$transaction(async (tx) => {
      const redemption = await tx.pointRedemption.findUnique({ where: { id: Number(id) } });
      if (!redemption) throw new BadRequestException('Data point redemption tidak ditemukan');

      const result = await tx.pointRedemption.delete({ where: { id: Number(id) } });
      await tx.customer.update({
        where: { id: redemption.customerId },
        data: { pointBalance: { increment: redemption.pointsRedeemed } },
      });

      await this.invalidateCache();
      await this.redis.invalidatePattern('customer:*');
      return result;
    });
  }
  // ═══════════════════════════════════════════════════════════════════
}
