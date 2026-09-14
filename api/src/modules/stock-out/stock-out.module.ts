import { Module } from '@nestjs/common';
import { StockOutController } from './stockOut.controller';
import { StockOutService } from './stockOut.service';

@Module({
  controllers: [StockOutController],
  providers: [StockOutService],
  exports: [StockOutService],
})
export class StockOutModule {}
