import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationService extends BaseService<
  any,
  CreateNotificationDto,
  UpdateNotificationDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'notification',
      primaryKey: 'ID',
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { CreatedAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 10,
      softDelete: true,
      softDeleteField: 'IsActive',
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════

  private async resolveTypeId(typeCode: string | undefined, fallbackCode: string): Promise<number> {
    const type = await this.prisma.notificationType.findUnique({
      where: { Code: typeCode || fallbackCode },
    });
    if (!type) throw new BadRequestException(`Tipe notifikasi '${typeCode || fallbackCode}' tidak ditemukan`);
    return type.ID;
  }

  async createNotification(dto: CreateNotificationDto): Promise<any> {
    const typeId = await this.resolveTypeId(dto.typeCode, 'REMINDER');

    const result = await this.prisma.notification.create({
      data: {
        UserID: dto.userId,
        Title: dto.title,
        Message: dto.message,
        TypeID: typeId,
        ReferenceType: dto.referenceType,
        ReferenceID: dto.referenceId,
      },
      include: { Type: true },
    });

    await this.invalidateCache();
    return result;
  }

  /**
   * Fire-and-forget helper for other services (Sale/Purchase/StockOut/etc.)
   * to raise a notification without needing the DTO validation roundtrip.
   */
  async notify(params: { title: string; message: string; typeCode: string; referenceType?: string; referenceId?: number; userId?: string }): Promise<void> {
    try {
      const typeId = await this.resolveTypeId(params.typeCode, 'REMINDER');
      await this.prisma.notification.create({
        data: {
          UserID: params.userId,
          Title: params.title,
          Message: params.message,
          TypeID: typeId,
          ReferenceType: params.referenceType,
          ReferenceID: params.referenceId,
        },
      });
      await this.invalidateCache();
    } catch {
      // Notifications are best-effort — never let a notification failure break the calling transaction.
    }
  }

  async unreadCount(userId?: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        IsRead: false,
        IsActive: true,
        OR: [{ UserID: null }, { UserID: userId }],
      },
    });
  }

  async markRead(id: number): Promise<any> {
    const result = await this.prisma.notification.update({
      where: { ID: id },
      data: { IsRead: true },
    });
    await this.invalidateCache();
    return result;
  }

  async markAllRead(userId?: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: {
        IsRead: false,
        OR: [{ UserID: null }, { UserID: userId }],
      },
      data: { IsRead: true },
    });
    await this.invalidateCache();
    return { count: result.count };
  }
}
