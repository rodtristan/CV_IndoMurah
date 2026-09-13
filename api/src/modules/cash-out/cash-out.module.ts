import { Module } from '@nestjs/common';
import { CashOutController } from './cash-out.controller';
import { CashOutService } from './cash-out.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { QueryModule } from '../../common/query/query-module';

@Module({
  imports: [PrismaModule, QueryModule],
  controllers: [CashOutController],
  providers: [CashOutService],
  exports: [CashOutService],
})
export class CashOutModule {}
