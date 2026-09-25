import { Module } from '@nestjs/common';
import { ChequePaymentController } from './cheque-payment.controller';
import { ChequePaymentService } from './cheque-payment.service';

@Module({
  controllers: [ChequePaymentController],
  providers: [ChequePaymentService],
  exports: [ChequePaymentService],
})
export class ChequePaymentModule {}
