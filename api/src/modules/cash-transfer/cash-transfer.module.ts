import { Module } from '@nestjs/common';
import { CashTransferController } from './cash-transfer.controller';
import { CashTransferService } from './cash-transfer.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { QueryModule } from '../../common/query/query-module';

@Module({
  imports: [PrismaModule, QueryModule],
  controllers: [CashTransferController],
  providers: [CashTransferService],
  exports: [CashTransferService],
})
export class CashTransferModule {}
