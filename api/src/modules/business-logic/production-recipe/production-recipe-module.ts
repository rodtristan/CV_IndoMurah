import { Module } from '@nestjs/common';
import { ProductionRecipeController } from './production-recipe-controller';
import { ProductionRecipeService } from './production-recipe-service';

@Module({
  controllers: [ProductionRecipeController],
  providers: [ProductionRecipeService],
  exports: [ProductionRecipeService],
})
export class ProductionRecipeModule {}
