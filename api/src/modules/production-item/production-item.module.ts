import { Module } from '@nestjs/common';
import { ProductionItemController } from './production-item.controller';
import { ProductionItemService } from './production-item.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ProductionItemController],
  providers: [ProductionItemService],
  exports: [ProductionItemService],
})
export class ProductionItemModule {}
