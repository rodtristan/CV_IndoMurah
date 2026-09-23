import { Module } from '@nestjs/common';
import { SupplierDebtController } from './supplier-debt-controller';
import { SupplierDebtService } from './supplier-debt-service';

@Module({
  controllers: [SupplierDebtController],
  providers: [SupplierDebtService],
  exports: [SupplierDebtService],
})
export class SupplierDebtModule {}
