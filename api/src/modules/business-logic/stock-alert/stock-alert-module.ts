import { Module } from '@nestjs/common';
import { StockAlertController } from './stock-alert-controller';
import { StockAlertService } from './stock-alert-service';

@Module({
  controllers: [StockAlertController],
  providers: [StockAlertService],
  exports: [StockAlertService],
})
export class StockAlertModule {}
