import { Module } from '@nestjs/common';
import { PointSettingController } from './point-setting.controller';
import { PointSettingService } from './point-setting.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [PointSettingController],
  providers: [PointSettingService],
  exports: [PointSettingService],
})
export class PointSettingModule {}
