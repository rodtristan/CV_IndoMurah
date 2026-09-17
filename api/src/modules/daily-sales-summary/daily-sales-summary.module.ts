import { Module } from '@nestjs/common';
import { DailySalesSummaryController } from './daily-sales-summary.controller';
import { DailySalesSummaryService } from './daily-sales-summary.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [DailySalesSummaryController],
  providers: [DailySalesSummaryService],
  exports: [DailySalesSummaryService],
})
export class DailySalesSummaryModule {}
