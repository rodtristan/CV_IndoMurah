import { Module } from '@nestjs/common';
import { CashInController } from './cash-in.controller';
import { CashInService } from './cash-in.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { QueryModule } from '../../common/query/query-module';

@Module({
  imports: [PrismaModule, QueryModule],
  controllers: [CashInController],
  providers: [CashInService],
  exports: [CashInService],
})
export class CashInModule {}
