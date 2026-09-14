import { Module } from '@nestjs/common';
import { StockTransferController } from './stockTransfer.controller';
import { StockTransferService } from './stockTransfer.service';

@Module({
  controllers: [StockTransferController],
  providers: [StockTransferService],
  exports: [StockTransferService],
})
export class StockTransferModule {}
