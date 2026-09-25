import { Module } from '@nestjs/common';
import { ShippingCostController } from './shipping-cost.controller';
import { ShippingCostService } from './shipping-cost.service';

@Module({
  controllers: [ShippingCostController],
  providers: [ShippingCostService],
  exports: [ShippingCostService],
})
export class ShippingCostModule {}
