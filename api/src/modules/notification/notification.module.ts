import { Module } from '@nestjs/common';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { PushController } from './push.controller';
import { PushService } from './push.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [NotificationController, PushController],
  providers: [NotificationService, PushService],
  exports: [NotificationService, PushService],
})
export class NotificationModule {}
