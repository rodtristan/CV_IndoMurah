import { Module } from '@nestjs/common';
import { CashOutController } from './cash-out.controller';
import { CashOutService } from './cash-out.service';

@Module({
  controllers: [CashOutController],
  providers: [CashOutService],
  exports: [CashOutService],
})
export class CashOutModule {}
