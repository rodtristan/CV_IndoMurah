import { Module } from '@nestjs/common';
import { CashTransferController } from './cash-transfer.controller';
import { CashTransferService } from './cash-transfer.service';

@Module({
  controllers: [CashTransferController],
  providers: [CashTransferService],
  exports: [CashTransferService],
})
export class CashTransferModule {}
