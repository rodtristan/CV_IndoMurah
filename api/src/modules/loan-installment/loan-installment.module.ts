import { Module } from '@nestjs/common';
import { LoanInstallmentController } from './loan-installment.controller';
import { LoanInstallmentService } from './loan-installment.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [LoanInstallmentController],
  providers: [LoanInstallmentService],
  exports: [LoanInstallmentService],
})
export class LoanInstallmentModule {}
