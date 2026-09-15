import { Module } from '@nestjs/common';
import { PurchaseOrderItemController } from './purchase-order-item.controller';
import { PurchaseOrderItemService } from './purchase-order-item.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [PurchaseOrderItemController],
  providers: [PurchaseOrderItemService],
  exports: [PurchaseOrderItemService],
})
export class PurchaseOrderItemModule {}
