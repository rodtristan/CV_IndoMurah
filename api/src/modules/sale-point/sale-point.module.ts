import { Module } from '@nestjs/common';
import { SalePointController } from './salePoint.controller';
import { SalePointService } from './salePoint.service';

@Module({
  controllers: [SalePointController],
  providers: [SalePointService],
  exports: [SalePointService],
})
export class SalePointModule {}
