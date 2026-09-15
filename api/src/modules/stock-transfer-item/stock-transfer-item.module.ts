import { Module } from '@nestjs/common';
import { StockTransferItemController } from './stock-transfer-item.controller';
import { StockTransferItemService } from './stock-transfer-item.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [StockTransferItemController],
  providers: [StockTransferItemService],
  exports: [StockTransferItemService],
})
export class StockTransferItemModule {}
