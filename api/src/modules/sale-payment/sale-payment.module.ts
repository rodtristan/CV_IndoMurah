import { Module } from '@nestjs/common';
import { SalePaymentController } from './sale-payment.controller';
import { SalePaymentService } from './sale-payment.service';

@Module({
  controllers: [SalePaymentController],
  providers: [SalePaymentService],
  exports: [SalePaymentService],
})
export class SalePaymentModule {}
