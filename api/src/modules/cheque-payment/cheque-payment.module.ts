import { Module } from '@nestjs/common';
import { ChequePaymentController } from './cheque-payment.controller';
import { ChequePaymentService } from './cheque-payment.service';
import { SalePaymentModule } from '../sale-payment/sale-payment.module';
import { PurchasePaymentModule } from '../purchase-payment/purchase-payment.module';

@Module({
  imports: [SalePaymentModule, PurchasePaymentModule],
  controllers: [ChequePaymentController],
  providers: [ChequePaymentService],
  exports: [ChequePaymentService],
})
export class ChequePaymentModule {}
