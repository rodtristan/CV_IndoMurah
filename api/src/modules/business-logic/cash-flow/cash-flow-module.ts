import { Module } from '@nestjs/common';
import { CashFlowController } from './cash-flow-controller';
import { CashFlowService } from './cash-flow-service';
import { PrismaModule } from '../../../common/prisma/prisma-module';

@Module({
  imports: [PrismaModule],
  controllers: [CashFlowController],
  providers: [CashFlowService],
  exports: [CashFlowService],
})
export class CashFlowModule {}
