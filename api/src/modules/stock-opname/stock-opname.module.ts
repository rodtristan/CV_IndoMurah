import { Module } from '@nestjs/common';
import { StockOpnameController } from './stockOpname.controller';
import { StockOpnameService } from './stockOpname.service';

@Module({
  controllers: [StockOpnameController],
  providers: [StockOpnameService],
  exports: [StockOpnameService],
})
export class StockOpnameModule {}
