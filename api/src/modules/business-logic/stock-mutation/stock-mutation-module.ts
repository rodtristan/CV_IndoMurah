import { Module } from '@nestjs/common';
import { StockMutationController } from './stock-mutation-controller';
import { StockMutationService } from './stock-mutation-service';
import { PrismaModule } from '../../../common/prisma/prisma-module';

@Module({
  imports: [PrismaModule],
  controllers: [StockMutationController],
  providers: [StockMutationService],
  exports: [StockMutationService],
})
export class StockMutationModule {}
