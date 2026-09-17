import { Module } from '@nestjs/common';
import { BrandLogoController } from './brand-logo.controller';
import { BrandLogoService } from './brand-logo.service';
import { PrismaModule } from '../../common/prisma/prisma-module';
import { RedisModule } from '../../common/redis/redis-module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [BrandLogoController],
  providers: [BrandLogoService],
  exports: [BrandLogoService],
})
export class BrandLogoModule {}
