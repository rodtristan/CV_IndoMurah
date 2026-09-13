import { Module } from '@nestjs/common';
import { PurchasePaymentController } from './purchase-payment.controller';
import { PurchasePaymentService } from './purchase-payment.service';

@Module({
  controllers: [PurchasePaymentController],
  providers: [PurchasePaymentService],
  exports: [PurchasePaymentService],
})
export class PurchasePaymentModule {}
