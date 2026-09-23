import { Module } from '@nestjs/common';
import { ProductionRequestController } from './production-request-controller';
import { ProductionRequestService } from './production-request-service';

@Module({
  controllers: [ProductionRequestController],
  providers: [ProductionRequestService],
  exports: [ProductionRequestService],
})
export class ProductionRequestModule {}
