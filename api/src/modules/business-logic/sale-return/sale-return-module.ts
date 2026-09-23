import { Module } from '@nestjs/common';
import { SaleReturnController } from './sale-return-controller';
import { SaleReturnService } from './sale-return-service';

@Module({
  controllers: [SaleReturnController],
  providers: [SaleReturnService],
  exports: [SaleReturnService],
})
export class SaleReturnModule {}
