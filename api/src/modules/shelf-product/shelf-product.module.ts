import { Module } from '@nestjs/common';
import { ShelfProductController } from './shelf-product.controller';
import { ShelfProductService } from './shelf-product.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ShelfProductController],
  providers: [ShelfProductService],
  exports: [ShelfProductService],
})
export class ShelfProductModule {}
