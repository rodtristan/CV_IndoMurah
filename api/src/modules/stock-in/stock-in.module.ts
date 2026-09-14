import { Module } from '@nestjs/common';
import { StockInController } from './stockIn.controller';
import { StockInService } from './stockIn.service';

@Module({
  controllers: [StockInController],
  providers: [StockInService],
  exports: [StockInService],
})
export class StockInModule {}
