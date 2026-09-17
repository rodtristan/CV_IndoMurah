import { Module } from '@nestjs/common';
import { ShelfController } from './shelf.controller';
import { ShelfService } from './shelf.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [ShelfController],
  providers: [ShelfService],
  exports: [ShelfService],
})
export class ShelfModule {}
