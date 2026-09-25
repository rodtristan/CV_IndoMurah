import { Module } from '@nestjs/common';
import { SubRegionController } from './sub-region.controller';
import { SubRegionService } from './sub-region.service';

@Module({
  controllers: [SubRegionController],
  providers: [SubRegionService],
  exports: [SubRegionService],
})
export class SubRegionModule {}
