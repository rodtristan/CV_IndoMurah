import { Module } from '@nestjs/common';
import { YearCloseController } from './year-close.controller';
import { FiscalYearModule } from '../fiscal-year/fiscal-year.module';

/** Legacy route shim — see YearCloseController. Safe to drop from app-module once no client uses it. */
@Module({
  imports: [FiscalYearModule],
  controllers: [YearCloseController],
})
export class YearCloseModule {}
