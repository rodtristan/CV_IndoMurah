import { Module, Global } from '@nestjs/common';
import { HashIdService } from './hash-id-service';

@Global()
@Module({
  providers: [HashIdService],
  exports: [HashIdService],
})
export class HashIdModule {}
