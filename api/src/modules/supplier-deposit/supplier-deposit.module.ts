import { Module } from '@nestjs/common';
import { SupplierDepositController } from './supplier-deposit.controller';
import { SupplierDepositService } from './supplier-deposit.service';

@Module({
  controllers: [SupplierDepositController],
  providers: [SupplierDepositService],
  exports: [SupplierDepositService],
})
export class SupplierDepositModule {}
