import { Module } from '@nestjs/common';
import { CustomerDepositController } from './customer-deposit-controller';
import { CustomerDepositService } from './customer-deposit-service';

@Module({
  controllers: [CustomerDepositController],
  providers: [CustomerDepositService],
  exports: [CustomerDepositService],
})
export class CustomerDepositModule {}
