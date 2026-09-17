import { Module } from '@nestjs/common';
import { LeaveBalanceController } from './leave-balance.controller';
import { LeaveBalanceService } from './leave-balance.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [LeaveBalanceController],
  providers: [LeaveBalanceService],
  exports: [LeaveBalanceService],
})
export class LeaveBalanceModule {}
