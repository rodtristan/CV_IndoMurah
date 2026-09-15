import { Module } from '@nestjs/common';
import { StockOpnameItemController } from './stock-opname-item.controller';
import { StockOpnameItemService } from './stock-opname-item.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [StockOpnameItemController],
  providers: [StockOpnameItemService],
  exports: [StockOpnameItemService],
})
export class StockOpnameItemModule {}
