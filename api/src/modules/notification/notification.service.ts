import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';
import { PushService, referenceUrl } from './push.service';
import { ADMIN_ROLE_NAMES } from '../../common/auth/authz-service';

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
    private readonly push: PushService,
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
    void this.pushOut(result.ID, dto.userId, dto.title, dto.message, dto.typeCode || 'REMINDER', dto.referenceType);
    return result;
  }

  /** Kirim notifikasi yang baru dibuat ke HP/desktop user (Web Push), tanpa menunggu. */
  private async pushOut(id: number, userId: string | null | undefined, title: string, body: string, typeCode: string, referenceType?: string | null) {
    await this.push.send(userId, { title, body, url: referenceUrl(referenceType), tag: `notif-${id}`, typeCode });
  }

  /**
   * Fire-and-forget helper for other services (Sale/Purchase/StockOut/etc.)
   * to raise a notification without needing the DTO validation roundtrip.
   */
  async notify(params: { title: string; message: string; typeCode: string; referenceType?: string; referenceId?: number; userId?: string }): Promise<void> {
    try {
      const typeId = await this.resolveTypeId(params.typeCode, 'REMINDER');
      const created = await this.prisma.notification.create({
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
      void this.pushOut(created.ID, params.userId, params.title, params.message, params.typeCode, params.referenceType);
    } catch {
      // Notifications are best-effort — never let a notification failure break the calling transaction.
    }
  }

  /**
   * Notifikasi untuk semua Administrator aktif (mis. absensi karyawan untuk HRD).
   * Satu baris per admin, jadi status dibaca tiap admin terpisah. Best-effort.
   */
  async notifyAdmins(params: { title: string; message: string; typeCode: string; referenceType?: string; referenceId?: number }): Promise<void> {
    try {
      const admins = await this.prisma.user.findMany({
        where: {
          IsActive: true,
          OR: [
            { Role: { equals: 'admin', mode: 'insensitive' } },
            { UserRoles: { some: { IsActive: true, Role: { IsActive: true, RoleName: { in: ADMIN_ROLE_NAMES, mode: 'insensitive' } } } } },
          ],
        },
        select: { ID: true },
      });
      for (const a of admins) await this.notify({ ...params, userId: a.ID });
    } catch {
      // best-effort
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
