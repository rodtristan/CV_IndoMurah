import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { StockBalanceController } from './stock-balance.controller';
import { StockBalanceService } from './stock-balance.service';

@Module({
  imports: [PrismaModule],
  controllers: [StockBalanceController],
  providers: [StockBalanceService],
})
export class StockBalanceModule {}
