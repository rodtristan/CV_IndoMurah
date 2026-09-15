import { Module } from '@nestjs/common';
import { SaleReturnItemController } from './sale-return-item.controller';
import { SaleReturnItemService } from './sale-return-item.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [SaleReturnItemController],
  providers: [SaleReturnItemService],
  exports: [SaleReturnItemService],
})
export class SaleReturnItemModule {}
