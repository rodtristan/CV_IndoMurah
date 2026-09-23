import { Module } from '@nestjs/common';
import { ProductionScheduleController } from './production-schedule-controller';
import { ProductionScheduleService } from './production-schedule-service';

@Module({
  controllers: [ProductionScheduleController],
  providers: [ProductionScheduleService],
  exports: [ProductionScheduleService],
})
export class ProductionScheduleModule {}
