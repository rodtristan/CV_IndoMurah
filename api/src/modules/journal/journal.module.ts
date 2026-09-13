import { Module } from '@nestjs/common';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { QueryModule } from '../../common/query/query-module';

@Module({
  imports: [PrismaModule, QueryModule],
  controllers: [JournalController],
  providers: [JournalService],
  exports: [JournalService],
})
export class JournalModule {}
