import { Module } from '@nestjs/common';
import { StockOpnameController } from './stock-opname.controller';
import { StockOpnameService } from './stock-opname.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { QueryModule } from '../../common/query/query-module';

@Module({
  imports: [PrismaModule, QueryModule],
  controllers: [StockOpnameController],
  providers: [StockOpnameService],
  exports: [StockOpnameService],
})
export class StockOpnameModule {}
