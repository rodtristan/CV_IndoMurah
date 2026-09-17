import { Module } from '@nestjs/common';
import { AppSettingController } from './app-setting.controller';
import { AppSettingService } from './app-setting.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [AppSettingController],
  providers: [AppSettingService],
  exports: [AppSettingService],
})
export class AppSettingModule {}
