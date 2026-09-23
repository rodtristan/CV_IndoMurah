import { Module } from '@nestjs/common';
import { CategoryBrandController } from './category-brand-controller';
import { CategoryBrandService } from './category-brand-service';

@Module({
  controllers: [CategoryBrandController],
  providers: [CategoryBrandService],
  exports: [CategoryBrandService],
})
export class CategoryBrandModule {}
