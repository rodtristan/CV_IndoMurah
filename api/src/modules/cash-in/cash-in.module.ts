import { Module } from '@nestjs/common';
import { CashInController } from './cash-in.controller';
import { CashInService } from './cash-in.service';

@Module({
  controllers: [CashInController],
  providers: [CashInService],
  exports: [CashInService],
})
export class CashInModule {}
