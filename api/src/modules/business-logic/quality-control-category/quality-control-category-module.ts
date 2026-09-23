import { Module } from '@nestjs/common';
import { QualityControlCategoryController } from './quality-control-category-controller';
import { QualityControlCategoryService } from './quality-control-category-service';

@Module({
  controllers: [QualityControlCategoryController],
  providers: [QualityControlCategoryService],
  exports: [QualityControlCategoryService],
})
export class QualityControlCategoryModule {}
