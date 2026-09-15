import { Module } from '@nestjs/common';
import { PurchaseReturnItemController } from './purchase-return-item.controller';
import { PurchaseReturnItemService } from './purchase-return-item.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [PurchaseReturnItemController],
  providers: [PurchaseReturnItemService],
  exports: [PurchaseReturnItemService],
})
export class PurchaseReturnItemModule {}
