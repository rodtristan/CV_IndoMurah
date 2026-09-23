import { Module } from '@nestjs/common';
import { HRMController } from './hrm-controller';
import { HRMService } from './hrm-service';

@Module({
  controllers: [HRMController],
  providers: [HRMService],
  exports: [HRMService],
})
export class HRMModule {}
