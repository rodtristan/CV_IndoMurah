import { Module } from '@nestjs/common';
import { MemberCardController } from './member-card-controller';
import { MemberCardService } from './member-card-service';

@Module({
  controllers: [MemberCardController],
  providers: [MemberCardService],
  exports: [MemberCardService],
})
export class MemberCardModule {}
