import { Module } from '@nestjs/common';
import { ProductStockController } from './product-stock.controller';
import { ProductStockService } from './product-stock.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ProductStockController],
  providers: [ProductStockService],
  exports: [ProductStockService],
})
export class ProductStockModule {}
