import { Module } from '@nestjs/common';
import { SalesPersonController } from './salesPerson.controller';
import { SalesPersonService } from './salesPerson.service';

@Module({
  controllers: [SalesPersonController],
  providers: [SalesPersonService],
  exports: [SalesPersonService],
})
export class SalesPersonModule {}
