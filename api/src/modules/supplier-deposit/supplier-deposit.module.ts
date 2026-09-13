import { Module } from '@nestjs/common';
import { SupplierDepositController } from './supplier-deposit.controller';
import { SupplierDepositService } from './supplier-deposit.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { QueryModule } from '../../common/query/query-module';

@Module({
  imports: [PrismaModule, QueryModule],
  controllers: [SupplierDepositController],
  providers: [SupplierDepositService],
  exports: [SupplierDepositService],
})
export class SupplierDepositModule {}
