import { Module } from '@nestjs/common';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { ReportEngineController } from './report-engine.controller';
import { ReportEngineService } from './report-engine.service';

@Module({
  imports: [PrismaModule],
  controllers: [ReportEngineController],
  providers: [ReportEngineService],
})
export class ReportEngineModule {}
