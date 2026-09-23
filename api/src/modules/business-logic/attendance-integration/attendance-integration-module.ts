import { Module } from '@nestjs/common';
import { AttendanceIntegrationController } from './attendance-integration-controller';
import { AttendanceIntegrationService } from './attendance-integration-service';

@Module({
  controllers: [AttendanceIntegrationController],
  providers: [AttendanceIntegrationService],
  exports: [AttendanceIntegrationService],
})
export class AttendanceIntegrationModule {}
