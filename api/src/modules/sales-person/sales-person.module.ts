import { Module } from '@nestjs/common';
import { SalesPersonController } from './sales-person.controller';
import { SalesPersonService } from './sales-person.service';

@Module({
  controllers: [SalesPersonController],
  providers: [SalesPersonService],
  exports: [SalesPersonService],
})
export class SalesPersonModule {}
