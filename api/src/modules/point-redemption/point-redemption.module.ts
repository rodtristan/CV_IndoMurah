import { Module } from '@nestjs/common';
import { PointRedemptionController } from './point-redemption.controller';
import { PointRedemptionService } from './point-redemption.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [PointRedemptionController],
  providers: [PointRedemptionService],
  exports: [PointRedemptionService],
})
export class PointRedemptionModule {}
