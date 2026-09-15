import { Module } from '@nestjs/common';
import { StockInItemController } from './stock-in-item.controller';
import { StockInItemService } from './stock-in-item.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [StockInItemController],
  providers: [StockInItemService],
  exports: [StockInItemService],
})
export class StockInItemModule {}
