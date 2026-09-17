import { Module } from '@nestjs/common';
import { ProductGroupController } from './product-group.controller';
import { ProductGroupService } from './product-group.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ProductGroupController],
  providers: [ProductGroupService],
  exports: [ProductGroupService],
})
export class ProductGroupModule {}
