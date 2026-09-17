import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma-service';
import { RedisService } from '../../common/redis/redis-service';
import { QueryService } from '../../common/query/query-service';
import { BaseService } from '../../common/templates/base.service';
import { CreateNotificationSettingDto, UpdateNotificationSettingDto } from './dto/notification-setting.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificationSettingService extends BaseService<
  any,
  CreateNotificationSettingDto,
  UpdateNotificationSettingDto
> {
  constructor(
    readonly prisma: PrismaService,
    readonly redis: RedisService,
    readonly queryService: QueryService,
  ) {
    super(prisma, redis, queryService, {
      modelName: 'notification-setting',
      primaryKey: 'id',
      // Use '*' to allow all fields (searchable, sortable, selectable, includable)
      searchableFields: ['*'],
      allowedIncludes: ['*'],
      allowedSortFields: ['*'],
      allowedSelectFields: ['*'],
      defaultOrderBy: { createdAt: 'desc' },
      maxTake: 100,
      defaultTake: 20,
      cacheTtl: 60,
      softDelete: true,
      softDeleteField: 'isActive',
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // BUSINESS LOGIC METHODS
  // ═══════════════════════════════════════════════════════════════════
  // Tambahkan method bisnis logic di sini
  // Contoh:
  //
  // async processTransaction(data: CreateNotificationSettingDto, userId: string) {
  //   return this.prisma.$transaction(async (tx) => {
  //     // 1. Create record
  //     const result = await tx.NotificationSetting.create({ data });
  //
  //     // 2. Update related records
  //     // await tx.relatedModel.update(...);
  //
  //     // 3. Invalidate cache
  //     await this.redis.del('cache:notification-setting:*');
  //
  //     return result;
  //   });
  // }
  // ═══════════════════════════════════════════════════════════════════
}
