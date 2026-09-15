import { Module } from '@nestjs/common';
import { StockOutItemController } from './stock-out-item.controller';
import { StockOutItemService } from './stock-out-item.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [StockOutItemController],
  providers: [StockOutItemService],
  exports: [StockOutItemService],
})
export class StockOutItemModule {}
