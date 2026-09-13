import { Module } from '@nestjs/common';
import { SalePointController } from './sale-point.controller';
import { SalePointService } from './sale-point.service';

@Module({
  controllers: [SalePointController],
  providers: [SalePointService],
  exports: [SalePointService],
})
export class SalePointModule {}
