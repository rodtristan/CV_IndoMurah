import { Module } from '@nestjs/common';
import { YearCloseController } from './year-close.controller';
import { YearCloseService } from './year-close.service';

@Module({
  controllers: [YearCloseController],
  providers: [YearCloseService],
  exports: [YearCloseService],
})
export class YearCloseModule {}
