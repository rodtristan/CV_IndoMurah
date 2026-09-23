import { Module } from '@nestjs/common';
import { SalesPersonController } from './salesperson-controller';
import { SalesPersonService } from './salesperson-service';

@Module({
  controllers: [SalesPersonController],
  providers: [SalesPersonService],
  exports: [SalesPersonService],
})
export class SalesPersonModule {}
