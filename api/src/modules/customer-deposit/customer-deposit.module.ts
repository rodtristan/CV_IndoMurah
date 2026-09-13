import { Module } from '@nestjs/common';
import { CustomerDepositController } from './customer-deposit.controller';
import { CustomerDepositService } from './customer-deposit.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { QueryModule } from '../../common/query/query-module';

@Module({
  imports: [PrismaModule, QueryModule],
  controllers: [CustomerDepositController],
  providers: [CustomerDepositService],
  exports: [CustomerDepositService],
})
export class CustomerDepositModule {}
