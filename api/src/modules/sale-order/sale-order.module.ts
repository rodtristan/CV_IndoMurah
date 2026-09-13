import { Module } from '@nestjs/common';
import { SaleOrderController } from './sale-order.controller';
import { SaleOrderService } from './sale-order.service';

@Module({
  controllers: [SaleOrderController],
  providers: [SaleOrderService],
  exports: [SaleOrderService],
})
export class SaleOrderModule {}
