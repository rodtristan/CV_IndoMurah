import { Module } from '@nestjs/common';
import { AssetCategoryController } from './asset-category.controller';
import { AssetCategoryService } from './asset-category.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [AssetCategoryController],
  providers: [AssetCategoryService],
  exports: [AssetCategoryService],
})
export class AssetCategoryModule {}
