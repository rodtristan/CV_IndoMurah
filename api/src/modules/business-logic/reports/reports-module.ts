import { Module } from '@nestjs/common';
import { ReportsController } from './reports-controller';
import { ReportsService } from './reports-service';
import { ReportsServiceExtensions } from './reports-service-extensions';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportsServiceExtensions],
  exports: [ReportsService, ReportsServiceExtensions],
})
export class ReportsModule {}
