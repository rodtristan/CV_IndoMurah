import { Module } from '@nestjs/common';
import { POSController } from './pos-controller';
import { POSService } from './pos-service';

@Module({
  controllers: [POSController],
  providers: [POSService],
  exports: [POSService],
})
export class POSModule {}
