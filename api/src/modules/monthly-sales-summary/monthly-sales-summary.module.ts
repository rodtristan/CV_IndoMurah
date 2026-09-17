import { Module } from '@nestjs/common';
import { MonthlySalesSummaryController } from './monthly-sales-summary.controller';
import { MonthlySalesSummaryService } from './monthly-sales-summary.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [MonthlySalesSummaryController],
  providers: [MonthlySalesSummaryService],
  exports: [MonthlySalesSummaryService],
})
export class MonthlySalesSummaryModule {}
