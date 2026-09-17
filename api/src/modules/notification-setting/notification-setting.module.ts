import { Module } from '@nestjs/common';
import { NotificationSettingController } from './notification-setting.controller';
import { NotificationSettingService } from './notification-setting.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [NotificationSettingController],
  providers: [NotificationSettingService],
  exports: [NotificationSettingService],
})
export class NotificationSettingModule {}
