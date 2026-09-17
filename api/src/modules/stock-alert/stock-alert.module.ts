import { Module } from '@nestjs/common';
import { StockAlertController } from './stock-alert.controller';
import { StockAlertService } from './stock-alert.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [StockAlertController],
  providers: [StockAlertService],
  exports: [StockAlertService],
})
export class StockAlertModule {}
