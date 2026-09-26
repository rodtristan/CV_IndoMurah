import { Module } from '@nestjs/common';
import { SalesCommissionController } from './sales-commission.controller';
import { SalesCommissionService } from './sales-commission.service';

@Module({
  controllers: [SalesCommissionController],
  providers: [SalesCommissionService],
  exports: [SalesCommissionService],
})
export class SalesCommissionModule {}
