import { Module } from '@nestjs/common';
import { FiscalYearController } from './fiscal-year.controller';
import { FiscalYearService } from './fiscal-year.service';

@Module({
  controllers: [FiscalYearController],
  providers: [FiscalYearService],
})
export class FiscalYearModule {}
