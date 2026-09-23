import { Module } from '@nestjs/common';
import { ProductionMaterialController } from './production-material-controller';
import { ProductionMaterialService } from './production-material-service';

@Module({
  controllers: [ProductionMaterialController],
  providers: [ProductionMaterialService],
  exports: [ProductionMaterialService],
})
export class ProductionMaterialModule {}
