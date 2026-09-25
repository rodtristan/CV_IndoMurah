import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { BalanceRepairController } from './balance-repair.controller';
import { BalanceRepairService } from './balance-repair.service';

@Module({
  imports: [PrismaModule],
  controllers: [BalanceRepairController],
  providers: [BalanceRepairService],
  exports: [BalanceRepairService],
})
export class BalanceRepairModule {}
