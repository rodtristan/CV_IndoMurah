import { Module } from '@nestjs/common';
import { EMoneyController } from './e-money.controller';
import { EMoneyService } from './e-money.service';

@Module({
  controllers: [EMoneyController],
  providers: [EMoneyService],
  exports: [EMoneyService],
})
export class EMoneyModule {}
